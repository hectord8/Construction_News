import * as cheerio from "cheerio";
import type { AnyNode, Element } from "domhandler";
import { eq, or, like } from "drizzle-orm";
import { db } from "./db";
import { articles, categories } from "./db/schema";
import { RSS_SOURCES } from "./rss-sources";

export type RssEntry = {
  title: string;
  url: string;
  pubDate?: Date;
  description?: string;
  author?: string;
};

export type ExtractedStory = {
  title: string;
  url: string;
  body: string;
  excerpt: string;
  coverImage?: string;
  author?: string;
  publishedAt?: Date;
  sourceName: string;
  sourceUrl: string;
};

export type ImportResult = {
  source: string;
  found: number;
  imported: number;
  skipped: number;
  error?: string;
};

export type ImportSummary = {
  imported: number;
  results: ImportResult[];
};

export function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    u.searchParams.sort();
    return u.toString().replace(/\/+$/, "");
  } catch {
    return url;
  }
}

export function uniqueSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return base || "untitled";
}

export async function isDuplicate(
  sourceUrl: string,
  slug: string,
): Promise<boolean> {
  const normalized = normalizeUrl(sourceUrl);
  const existing = await db.query.articles.findFirst({
    where: or(
      eq(articles.sourceUrl, normalized),
      eq(articles.slug, slug),
      like(articles.slug, `${slug}-%`),
    ),
  });
  return Boolean(existing);
}

export function htmlToMarkdown(html: string): string {
  const $ = cheerio.load(html);
  $("script, style, noscript, iframe, nav, aside, form, button").remove();

  const lines: string[] = [];
  const walk = (el: AnyNode) => {
    if (el.type === "text") {
      lines.push(el.data ?? "");
      return;
    }
    if (el.type !== "tag") return;
    const tag = el.tagName;
    if (["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)) {
      const level = parseInt(tag[1]);
      lines.push("");
      lines.push("#".repeat(level) + " " + $(el).text().trim());
      lines.push("");
      return;
    }
    if (tag === "p") {
      lines.push("");
      $(el).contents().each((_, c) => walk(c));
      lines.push("");
      return;
    }
    if (tag === "li") {
      lines.push("- " + $(el).text().trim());
      return;
    }
    if (tag === "img") {
      const src = $(el).attr("src");
      const alt = $(el).attr("alt") || "";
      if (src) lines.push(`![${alt}](${src})`);
      return;
    }
    if (tag === "a") {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      if (href && text) lines.push(`[${text}](${href})`);
      else if (text) lines.push(text);
      return;
    }
    $(el).contents().each((_, c) => walk(c));
  };

  $("body").contents().each((_, el) => walk(el));
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function parseRssFeed(xml: string): Promise<RssEntry[]> {
  const $ = cheerio.load(xml, { xmlMode: true });
  const entries: RssEntry[] = [];

  $("item").each((_, el) => {
    const title = $(el).find("title").first().text().trim();
    const link = $(el).find("link").first().text().trim();
    const pubDateStr = $(el).find("pubDate").first().text().trim();
    const description = $(el).find("description").first().text().trim();
    const author = $(el).find("author, dc\\:creator").first().text().trim();

    if (title && link) {
      entries.push({
        title,
        url: link,
        pubDate: pubDateStr ? new Date(pubDateStr) : undefined,
        description,
        author: author || undefined,
      });
    }
  });

  if (entries.length === 0) {
    $("entry").each((_, el) => {
      const title = $(el).find("title").first().text().trim();
      const link =
        $(el).find("link").first().attr("href") ||
        $(el).find("link").first().text().trim();
      const pubDateStr =
        $(el).find("published").first().text().trim() ||
        $(el).find("updated").first().text().trim();
      const description = $(el).find("summary, content").first().text().trim();
      const author = $(el).find("author name").first().text().trim();

      if (title && link) {
        entries.push({
          title,
          url: link,
          pubDate: pubDateStr ? new Date(pubDateStr) : undefined,
          description,
          author: author || undefined,
        });
      }
    });
  }

  return entries;
}

export async function fetchRssFeed(url: string): Promise<RssEntry[]> {
  const res = await fetch(url, {
    headers: { "User-Agent": "BuildWire/1.0 (news aggregator)" },
    redirect: "follow",
  });
  if (!res.ok)
    throw new Error(`Feed fetch failed: ${res.status} ${res.statusText}`);
  const xml = await res.text();
  return parseRssFeed(xml);
}

function metaContent($: cheerio.CheerioAPI, property: string): string | null {
  return (
    $(`meta[property="${property}"]`).attr("content") ||
    $(`meta[name="${property}"]`).attr("content") ||
    null
  );
}

function cleanTitle(title: string): string {
  return title.replace(/\s*\|[^|]{1,60}$/, "").replace(/\s+/g, " ").trim();
}

function firstContentImage($: cheerio.CheerioAPI): string | null {
  const bad = /logo|icon|sprite|avatar|favicon|placeholder|banner/i;
  for (const sel of [
    "article img",
    "main img",
    "[role=main] img",
    ".entry-content img",
    ".post-content img",
  ]) {
    const imgs = $(sel).toArray();
    for (const img of imgs) {
      const el = img as Element;
      const src = el.attribs.src;
      const w = parseInt(el.attribs.width ?? "", 10);
      const h = parseInt(el.attribs.height ?? "", 10);
      if (!src || bad.test(src)) continue;
      if ((Number.isFinite(w) && w < 120) || (Number.isFinite(h) && h < 120)) {
        continue;
      }
      return src;
    }
  }
  return null;
}

function extractBodyMarkdown($: cheerio.CheerioAPI): string {
  const candidates = [
    "article",
    "main",
    "[role=main]",
    ".entry-content",
    ".post-content",
    ".article-body",
    ".story-body",
  ];

  let bestEl: Element | null = null;
  let bestScore = 0;
  for (const sel of candidates) {
    $(sel).each((_, el) => {
      const text = $(el).text();
      const score = text.length;
      if (score > bestScore) {
        bestEl = el as Element;
        bestScore = score;
      }
    });
  }

  if (!bestEl || bestScore < 200) {
    return htmlToMarkdown($("body").html() || "");
  }

  const $container = $(bestEl);
  $container
    .find(
      "script, style, noscript, iframe, nav, aside, form, button, figure, .ad, .ads, .advert, .advertisement, .related, .share, .sharebar, .share-bar, .social, .social-share, .byline, .post-meta, .tags, .comment, .newsletter, .author-box, .breadcrumb",
    )
    .remove();

  $container.find("a").each((_, el) => {
    const href = (el as Element).attribs.href ?? "";
    if (
      /twitter\.com\/intent|facebook\.com\/share|facebook\.com\/sharer|linkedin\.com\/share|linkedin\.com\/shareArticle|mailto:|whatsapp\.com|pinterest\.com\/pin|reddit\.com\/submit|addtoany/i.test(
        href,
      )
    ) {
      const $a = $(el);
      const li = $a.closest("li");
      if (li.length) {
        li.remove();
      } else {
        const ul = $a.closest("ul");
        if (ul.length) ul.remove();
        else $a.remove();
      }
    }
  });

  return htmlToMarkdown($container.html() || "");
}

export async function extractFromUrl(
  url: string,
): Promise<ExtractedStory | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "BuildWire/1.0 (news extractor)" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const html = await res.text();
    const $ = cheerio.load(html);

    const title =
      cleanTitle(metaContent($, "og:title") || $("title").first().text()) ||
      "";
    if (!title) return null;

    const excerpt =
      metaContent($, "og:description") ||
      metaContent($, "description") ||
      "";

    const coverImage =
      metaContent($, "og:image") || firstContentImage($) || undefined;

    const author =
      metaContent($, "author") || metaContent($, "article:author") || undefined;

    const publishedAt = metaContent($, "article:published_time")
      ? new Date(metaContent($, "article:published_time")!)
      : undefined;

    const body = extractBodyMarkdown($);

    return {
      title,
      url,
      body,
      excerpt: excerpt.slice(0, 300),
      coverImage,
      author,
      publishedAt,
      sourceName: "",
      sourceUrl: normalizeUrl(url),
    };
  } catch (err) {
    console.error("extractFromUrl failed:", url, err);
    return null;
  }
}

export async function runRssImport(): Promise<ImportSummary> {
  const results: ImportResult[] = [];
  let totalImported = 0;

  for (const source of RSS_SOURCES) {
    try {
      const entries = await fetchRssFeed(source.feedUrl);
      let imported = 0;
      let skipped = 0;

      for (const entry of entries) {
        const slug = uniqueSlug(entry.title);
        const normalizedUrl = normalizeUrl(entry.url);

        if (await isDuplicate(normalizedUrl, slug)) {
          skipped++;
          continue;
        }

        const category = await db.query.categories.findFirst({
          where: eq(categories.slug, source.categorySlug),
        });
        if (!category) {
          skipped++;
          continue;
        }

        await db.insert(articles).values({
          title: entry.title,
          slug,
          excerpt: entry.description ? entry.description.slice(0, 300) : "",
          body: entry.description || "",
          categorySlug: source.categorySlug,
          region: source.region,
          status: "draft",
          sourceUrl: normalizedUrl,
          sourceName: source.name,
          authorName: entry.author || "Unknown",
          publishedAt: entry.pubDate || new Date(),
        });

        imported++;
      }

      results.push({
        source: source.name,
        found: entries.length,
        imported,
        skipped,
      });
      totalImported += imported;
    } catch (err) {
      results.push({
        source: source.name,
        found: 0,
        imported: 0,
        skipped: 0,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { imported: totalImported, results };
}
