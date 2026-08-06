import { getPublishedArticles } from "@/lib/queries";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function GET() {
  const articles = await getPublishedArticles({ limit: 50 });

  const items = articles
    .map(
      (a) => `
  <item>
    <title>${escapeXml(a.title)}</title>
    <link>${SITE}/articles/${a.slug}</link>
    <guid isPermaLink="true">${SITE}/articles/${a.slug}</guid>
    <description>${escapeXml(a.excerpt)}</description>
    <pubDate>${a.publishedAt?.toUTCString() ?? ""}</pubDate>
    <author>${escapeXml(a.authorName)}</author>
    <category>${escapeXml(a.category.name)}</category>
  </item>`,
    )
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BuildWire — Construction News</title>
    <link>${SITE}</link>
    <description>Daily construction industry news and analysis.</description>
    <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60",
    },
  });
}

function escapeXml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
