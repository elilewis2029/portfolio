/**
 * Move the portfolio from one Supabase project to another: schema, rows, storage objects,
 * PostgREST schema exposure, auth URLs, and (with --vercel) the Vercel env vars.
 *
 *   npm run migrate-supabase -- [--dry-run] [--vercel]
 *
 * Env (names only; never print values):
 *   NEW_SUPABASE_URL                                 target project URL (https://<ref>.supabase.co); its service key is fetched via the access token
 *   OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY   source project; default to NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (the live project)
 *   NEW_SUPABASE_SERVICE_ROLE_KEY                    optional override for the target's service key
 *   SUPABASE_ACCESS_TOKEN                            personal access token (Management API) for DDL, config and api keys
 *   VERCEL_TOKEN                                     only with --vercel
 *
 * The source project is never written to or deleted from. Re-running is safe: every step upserts.
 */
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

config({ path: ".env.local" });

const DRY = process.argv.includes("--dry-run");
const DO_VERCEL = process.argv.includes("--vercel");
const SITE_URL = "https://elilewisportfolio.info";
const BUCKET = "portfolio";
const API = "https://api.supabase.com/v1";

const clean = (u?: string) => (u ?? "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const refOf = (u: string) => u.replace(/^https?:\/\//, "").split(".")[0];

const OLD_URL = clean(process.env.OLD_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL);
const OLD_KEY = process.env.OLD_SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const NEW_URL = clean(process.env.NEW_SUPABASE_URL);
let NEW_KEY = process.env.NEW_SUPABASE_SERVICE_ROLE_KEY ?? "";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN ?? "";

function need(cond: unknown, msg: string): asserts cond {
  if (!cond) {
    console.error("✗ " + msg);
    process.exit(1);
  }
}
need(OLD_URL && OLD_KEY, "Source project missing: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or OLD_SUPABASE_URL / OLD_SUPABASE_SERVICE_ROLE_KEY).");
need(NEW_URL, "Set NEW_SUPABASE_URL to the target project's URL, e.g. https://<ref>.supabase.co.");
need(refOf(OLD_URL) !== refOf(NEW_URL), "Source and target are the same project; nothing to do.");
need(TOKEN, "Set SUPABASE_ACCESS_TOKEN (Supabase dashboard → Account → Access Tokens) so the schema and settings can be applied.");

const OLD_REF = refOf(OLD_URL);
const NEW_REF = refOf(NEW_URL);
const log = (s: string) => console.log((DRY ? "[dry] " : "") + s);

type Db = ReturnType<typeof mk>;
const mk = (url: string, key: string) =>
  createClient(url, key, { db: { schema: "portfolio" }, auth: { persistSession: false } });

async function mgmt<T = unknown>(method: string, p: string, body?: unknown): Promise<T> {
  const r = await fetch(API + p, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`${method} ${p} → ${r.status}: ${text.slice(0, 300)}`);
  return (text ? JSON.parse(text) : null) as T;
}

async function sql(ref: string, query: string) {
  return mgmt("POST", `/projects/${ref}/database/query`, { query });
}

// ---------- 0. identify both projects ----------
type Proj = { id: string; name: string; status: string };
const all = await mgmt<Proj[]>("GET", "/projects");
const oldP = all.find((p) => p.id === OLD_REF); // may be in another account; the source is only read with its service key
const newP = all.find((p) => p.id === NEW_REF);
need(newP, `Access token can't see the target project ${NEW_REF}. It must come from the account that owns it.`);
log(`source: ${oldP ? `${oldP.name} (${OLD_REF}, ${oldP.status})` : `${OLD_REF} (not visible to this token; read via service key only)`}`);
log(`target: ${newP.name} (${NEW_REF}, ${newP.status})`);
need(newP.status === "ACTIVE_HEALTHY", `Target project is ${newP.status}; wait until it is ACTIVE_HEALTHY.`);

type Key = { name: string; api_key: string };
const targetKeys = await mgmt<Key[]>("GET", `/projects/${NEW_REF}/api-keys?reveal=true`);
if (!NEW_KEY) NEW_KEY = targetKeys.find((k) => k.name === "service_role")?.api_key ?? "";
need(NEW_KEY, "Could not read the target project's service_role key; set NEW_SUPABASE_SERVICE_ROLE_KEY.");

// ---------- 1. schema ----------
const migrations = ["0001_portfolio.sql", "0002_chat_intake.sql", "0003_series.sql"].map((f) => path.join("supabase", "migrations", f));
for (const file of migrations) {
  const body = readFileSync(file, "utf8");
  if (DRY) {
    log(`would run ${file} (${body.length} chars) on ${NEW_REF}`);
    continue;
  }
  try {
    await sql(NEW_REF, body);
    log(`ran ${file}`);
  } catch (e) {
    const msg = String(e);
    if (/already exists|duplicate/i.test(msg)) log(`${file}: objects already exist, continuing`);
    else throw e;
  }
}

// ---------- 2. expose schema `portfolio` through PostgREST ----------
type Pg = { db_schema: string };
const pg = await mgmt<Pg>("GET", `/projects/${NEW_REF}/postgrest`);
const schemas = pg.db_schema.split(",").map((s) => s.trim()).filter(Boolean);
if (!schemas.includes("portfolio")) {
  const db_schema = [...schemas, "portfolio"].join(", ");
  if (!DRY) await mgmt("PATCH", `/projects/${NEW_REF}/postgrest`, { db_schema });
  log(`exposed schema portfolio (db_schema = ${db_schema})`);
} else log("schema portfolio already exposed");

// ---------- 3. auth URLs ----------
type Auth = { site_url: string; uri_allow_list: string };
const auth = await mgmt<Auth>("GET", `/projects/${NEW_REF}/config/auth`);
const current = (auth.uri_allow_list || "").split(",").map((s) => s.trim()).filter(Boolean);
const wantAllow = new Set(current);
[`${SITE_URL}/**`, "https://*.vercel.app/**", "http://localhost:3000/**"].forEach((u) => wantAllow.add(u));
if (auth.site_url !== SITE_URL || wantAllow.size !== current.length) {
  if (!DRY) await mgmt("PATCH", `/projects/${NEW_REF}/config/auth`, { site_url: SITE_URL, uri_allow_list: [...wantAllow].join(",") });
  log(`auth: site_url=${SITE_URL}, redirect allow list has ${wantAllow.size} entries`);
} else log("auth URLs already set");

// ---------- 4. rows ----------
const src = mk(OLD_URL, OLD_KEY);
const dst = mk(NEW_URL, NEW_KEY);

async function rows<T>(c: Db, table: string): Promise<T[]> {
  const { data, error } = await c.from(table).select("*").order("created_at", { ascending: true });
  if (error) throw new Error(`${table}: ${error.message}`);
  return (data ?? []) as T[];
}
type Project = { id: string; slug: string; cover_media: string | null; [k: string]: unknown };
type Media = { id: string; project_id: string; path: string; [k: string]: unknown };

const projects = await rows<Project>(src, "projects");
const media = await rows<Media>(src, "media");
log(`source has ${projects.length} projects, ${media.length} media rows`);

if (!DRY) {
  // projects first without cover_media (it references media), then media, then cover_media.
  const { error: e1 } = await dst.from("projects").upsert(projects.map((p) => ({ ...p, cover_media: null })), { onConflict: "id" });
  if (e1) throw new Error("projects upsert: " + e1.message);
  const { error: e2 } = await dst.from("media").upsert(media, { onConflict: "id" });
  if (e2) throw new Error("media upsert: " + e2.message);
  for (const p of projects.filter((p) => p.cover_media)) {
    const { error } = await dst.from("projects").update({ cover_media: p.cover_media }).eq("id", p.id);
    if (error) throw new Error(`cover_media ${p.slug}: ${error.message}`);
  }
  log("rows copied");
}

// ---------- 5. storage objects ----------
async function listAll(c: Db, prefix = ""): Promise<string[]> {
  const { data, error } = await c.storage.from(BUCKET).list(prefix, { limit: 1000 });
  if (error) throw new Error(`list ${prefix || "/"}: ${error.message}`);
  const out: string[] = [];
  for (const e of data ?? []) {
    const full = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.id === null) out.push(...(await listAll(c, full))); // folder
    else out.push(full);
  }
  return out;
}
const objects = await listAll(src);
log(`source bucket has ${objects.length} objects`);
const { data: buckets } = await dst.storage.listBuckets();
if (!buckets?.some((b) => b.name === BUCKET)) {
  if (!DRY) {
    const { error } = await dst.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
  }
  log(`created bucket ${BUCKET} (public)`);
}
let copied = 0;
for (const key of objects) {
  if (DRY) continue;
  const { data: blob, error } = await src.storage.from(BUCKET).download(key);
  if (error || !blob) throw new Error(`download ${key}: ${error?.message}`);
  const { error: up } = await dst.storage
    .from(BUCKET)
    .upload(key, Buffer.from(await blob.arrayBuffer()), { contentType: blob.type || undefined, upsert: true });
  if (up) throw new Error(`upload ${key}: ${up.message}`);
  copied++;
}
if (!DRY) log(`copied ${copied} objects`);

// ---------- 6. verify ----------
if (!DRY) {
  const p2 = await rows<Project>(dst, "projects");
  const m2 = await rows<Media>(dst, "media");
  const o2 = await listAll(dst);
  const ok = p2.length >= projects.length && m2.length >= media.length && o2.length >= objects.length;
  log(`target now has ${p2.length} projects, ${m2.length} media rows, ${o2.length} objects → ${ok ? "OK" : "MISMATCH"}`);
  need(ok, "Counts don't match; nothing was deleted from the source. Re-run after fixing the error above.");
}

// ---------- 7. Vercel env vars ----------
if (DO_VERCEL) {
  const vt = process.env.VERCEL_TOKEN;
  need(vt, "Set VERCEL_TOKEN for --vercel.");
  const anon = targetKeys.find((k) => k.name === "anon")?.api_key;
  const service = NEW_KEY;
  need(anon && service, "Could not read the target project's anon / service_role keys.");
  const vars: Record<string, string> = {
    NEXT_PUBLIC_SUPABASE_URL: NEW_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: service,
  };
  for (const [name, value] of Object.entries(vars)) {
    for (const env of ["production", "preview", "development"]) {
      if (DRY) {
        log(`would set ${name} for ${env}`);
        continue;
      }
      try {
        execFileSync("vercel", ["env", "rm", name, env, "--yes", "--token", vt], { stdio: "ignore" });
      } catch {
        /* not set yet */
      }
      execFileSync("vercel", ["env", "add", name, env, "--token", vt], { input: value, stdio: ["pipe", "ignore", "inherit"] });
    }
    log(`set ${name} on Vercel (production, preview, development)`);
  }
  log("redeploy production so the new values take effect (merge any PR, or `vercel redeploy <prod url>`).");
}

log(`done. Source project ${OLD_REF} was not modified; drop its portfolio schema and bucket only after the live site is verified.`);
