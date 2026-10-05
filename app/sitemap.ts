import type { MetadataRoute } from "next";
import { SITE_URL } from "./layout";
import { listProjects } from "@/lib/projects";

// Rebuilt at most hourly so newly published projects show up without a redeploy.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [current, archive] = await Promise.all([listProjects("current"), listProjects("archive")]);
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/work`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/archive`, changeFrequency: "monthly", priority: 0.3 },
  ];
  for (const p of [...current, ...archive]) {
    pages.push({ url: `${SITE_URL}/work/${p.slug}`, lastModified: p.updated_at, changeFrequency: "monthly", priority: 0.7 });
  }
  return pages;
}
