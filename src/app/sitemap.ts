import type { MetadataRoute } from "next";
import { getAllPublishedArticleSlugs, getCategories } from "@/lib/queries";

// Queries the DB for article URLs; must not prerender during `next build`
// (Railway's build env can't reach the private Postgres hostname).
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const [articleRows, categories] = await Promise.all([
    getAllPublishedArticleSlugs(),
    getCategories(),
  ]);

  const articles: MetadataRoute.Sitemap = articleRows.map((a) => ({
    url: `${base}/articles/${a.slug}`,
    lastModified: a.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${base}/category/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/about`, priority: 0.4 },
    { url: `${base}/advertise`, priority: 0.3 },
    { url: `${base}/contact`, priority: 0.3 },
    { url: `${base}/newsletter`, priority: 0.4 },
    { url: `${base}/search`, changeFrequency: "weekly", priority: 0.5 },
  ];

  return [...staticPages, ...categoryPages, ...articles];
}
