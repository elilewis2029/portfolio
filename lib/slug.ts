export function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/\[todo[^\]]*\]/gi, "")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "project";
}

export function uniqueSlug(base: string, taken: Set<string>) {
  let s = slugify(base);
  for (let i = 2; taken.has(s); i++) s = `${slugify(base)}-${i}`;
  return s;
}
