import "server-only";

import { and, desc, eq, gte, inArray, sql, lt } from "drizzle-orm";
import { db } from "./db";
import { articles, articleTags, categories, tags } from "./db/schema";

export type ArticleWithCategory = typeof articles.$inferSelect & {
  category: typeof categories.$inferSelect;
  tags: string[];
};

const articleColumns = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  body: true,
  coverImage: true,
  categorySlug: true,
  region: true,
  authorName: true,
  publishedAt: true,
  featured: true,
  leadStory: true,
  status: true,
  viewCount: true,
} as const;

export async function getCategories() {
  return db
    .select({
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      order: categories.order,
    })
    .from(categories)
    .orderBy(categories.order);
}

export async function getCategory(slug: string) {
  return db.query.categories.findFirst({ where: eq(categories.slug, slug) });
}

export async function getPublishedArticles(opts: { limit?: number } = {}) {
  const rows = await db.query.articles.findMany({
    where: eq(articles.status, "published"),
    columns: articleColumns,
    with: {
      category: true,
      tags: { with: { tag: true } },
    },
    orderBy: desc(articles.publishedAt),
    limit: opts.limit,
  });
  return rows.map((r) => ({
    ...r,
    tags: r.tags.map((t) => t.tag.slug),
  }));
}

export async function getLeadStory() {
  const row = await db.query.articles.findFirst({
    where: and(
      eq(articles.status, "published"),
      eq(articles.leadStory, true),
    ),
    columns: articleColumns,
    with: {
      category: true,
      tags: { with: { tag: true } },
    },
    orderBy: desc(articles.publishedAt),
  });
  return row ? { ...row, tags: row.tags.map((t) => t.tag.slug) } : null;
}

export async function getFeaturedArticles(limit = 6) {
  const rows = await db.query.articles.findMany({
    where: and(
      eq(articles.status, "published"),
      eq(articles.featured, true),
    ),
    columns: articleColumns,
    with: {
      category: true,
      tags: { with: { tag: true } },
    },
    orderBy: desc(articles.publishedAt),
    limit,
  });
  return rows.map((r) => ({ ...r, tags: r.tags.map((t) => t.tag.slug) }));
}

export async function getTrendingArticles(limit = 6) {
  const rows = await db.query.articles.findMany({
    where: and(
      eq(articles.status, "published"),
      sql`${articles.publishedAt} >= now() - interval '21 days'`,
    ),
    columns: articleColumns,
    with: {
      category: true,
      tags: { with: { tag: true } },
    },
    orderBy: desc(articles.viewCount),
    limit,
  });
  return rows.map((r) => ({ ...r, tags: r.tags.map((t) => t.tag.slug) }));
}

export async function getArticlesByCategory(
  slug: string,
  opts: { limit?: number; offset?: number } = {},
) {
  const rows = await db.query.articles.findMany({
    where: and(
      eq(articles.status, "published"),
      eq(articles.categorySlug, slug),
    ),
    columns: articleColumns,
    with: {
      category: true,
      tags: { with: { tag: true } },
    },
    orderBy: desc(articles.publishedAt),
    limit: opts.limit,
    offset: opts.offset,
  });
  return rows.map((r) => ({ ...r, tags: r.tags.map((t) => t.tag.slug) }));
}

export async function getArticlesByTag(
  slug: string,
  opts: { limit?: number } = {},
) {
  const tag = await db.query.tags.findFirst({ where: eq(tags.slug, slug) });
  if (!tag) return [];

  const rows = await db.query.articleTags.findMany({
    where: eq(articleTags.tagSlug, slug),
    with: {
      article: {
        columns: articleColumns,
        with: { category: true, tags: { with: { tag: true } } },
      },
    },
    limit: opts.limit,
  });
  return rows
    .map((r) => ({
      ...r.article,
      tags: r.article.tags.map((t) => t.tag.slug),
    }))
    .filter((a) => a.status === "published");
}

export async function getArticleBySlug(slug: string) {
  const row = await db.query.articles.findFirst({
    where: and(eq(articles.slug, slug), eq(articles.status, "published")),
    with: {
      category: true,
      tags: { with: { tag: true } },
      savedArticles: true,
    },
  });
  if (!row) return null;
  return {
    ...row,
    tags: row.tags.map((t) => t.tag.slug),
    savedCount: row.savedArticles.length,
  };
}

export async function getArticleById(id: string) {
  const row = await db.query.articles.findFirst({
    where: eq(articles.id, id),
    with: {
      category: true,
      tags: { with: { tag: true } },
    },
  });
  if (!row) return null;
  return { ...row, tags: row.tags.map((t) => t.tag.slug) };
}

export async function getRelatedArticles(
  articleId: string,
  categorySlug: string,
  tagSlugs: string[],
  limit = 3,
) {
  if (!tagSlugs.length) {
    const rows = await db.query.articles.findMany({
      where: and(
        eq(articles.status, "published"),
        eq(articles.categorySlug, categorySlug),
        sql`${articles.id} != ${articleId}`,
      ),
      columns: articleColumns,
      with: { category: true, tags: { with: { tag: true } } },
      orderBy: desc(articles.publishedAt),
      limit,
    });
    return rows.map((r) => ({ ...r, tags: r.tags.map((t) => t.tag.slug) }));
  }

  const rows = await db.query.articleTags.findMany({
    where: and(
      inArray(articleTags.tagSlug, tagSlugs),
      sql`${articleTags.articleId} != ${articleId}`,
    ),
    with: {
      article: {
        columns: articleColumns,
        with: { category: true, tags: { with: { tag: true } } },
      },
    },
    limit: 50,
  });

  const counts = new Map<string, number>();
  for (const r of rows) {
    if (r.article.status !== "published") continue;
    counts.set(r.articleId, (counts.get(r.articleId) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => {
      const found = rows.find((r) => r.articleId === id)!;
      return {
        ...found.article,
        tags: found.article.tags.map((t) => t.tag.slug),
      };
    });
}

export async function getAllTags() {
  return db.select().from(tags).orderBy(tags.name);
}

export async function searchArticles(params: {
  query?: string;
  category?: string;
  region?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}) {
  const conditions = [eq(articles.status, "published")];
  const orderExprs: ReturnType<typeof desc>[] = [];

  if (params.category) {
    conditions.push(eq(articles.categorySlug, params.category));
  }
  if (params.region) {
    conditions.push(eq(articles.region, params.region));
  }
  if (params.from) {
    conditions.push(gte(articles.publishedAt, new Date(params.from)));
  }
  if (params.to) {
    conditions.push(lt(articles.publishedAt, new Date(params.to)));
  }

  if (params.query) {
    conditions.push(
      sql`${articles.searchVector} @@ websearch_to_tsquery('english', ${params.query})`,
    );
    orderExprs.push(
      desc(
        sql`ts_rank(${articles.searchVector}, websearch_to_tsquery('english', ${params.query}))`,
      ),
    );
  }
  orderExprs.push(desc(articles.publishedAt));

  const rows = await db.query.articles.findMany({
    where: and(...conditions),
    columns: articleColumns,
    with: { category: true, tags: { with: { tag: true } } },
    orderBy: orderExprs,
    limit: params.limit ?? 20,
    offset: params.offset ?? 0,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(articles)
    .where(and(...conditions));

  return {
    results: rows.map((r) => ({ ...r, tags: r.tags.map((t) => t.tag.slug) })),
    total: Number(count),
  };
}

export async function getAllPublishedArticleSlugs() {
  const rows = await db
    .select({ slug: articles.slug, updatedAt: articles.updatedAt })
    .from(articles)
    .where(eq(articles.status, "published"));
  return rows;
}
