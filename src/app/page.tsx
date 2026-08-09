import Link from "next/link";
import type { Metadata } from "next";
import {
  getCategories,
  getArticlesByCategory,
  getLeadStory,
  getTrendingArticles,
} from "@/lib/queries";
import {
  ArticleCard,
  type ArticleCardData,
} from "@/components/article-card";
import { formatDate, readingTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Construction News & Analysis",
};

export default async function HomePage() {
  const [leadStory, categories, trending] = await Promise.all([
    getLeadStory(),
    getCategories(),
    getTrendingArticles(6),
  ]);

  const categoryArticles = await Promise.all(
    categories.map((c) => getArticlesByCategory(c.slug, { limit: 3 })),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="py-8">
        {leadStory ? (
          <div className="grid gap-8 lg:grid-cols-3">
            <Link
              href={`/articles/${leadStory.slug}`}
              className="group col-span-2 block"
            >
              <div className="flex h-full flex-col justify-between gap-6 rounded-xl bg-charcoal p-6 text-white sm:p-8">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                  <span className="rounded-full bg-accent px-2.5 py-1 text-white">
                    Lead story
                  </span>
                  <span>{leadStory.category.name}</span>
                  {leadStory.region && <span>{leadStory.region}</span>}
                </div>
                <div>
                  <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-[2.75rem]">
                    {leadStory.title}
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
                    {leadStory.excerpt}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/60">
                    <span className="font-medium text-white">
                      {leadStory.authorName}
                    </span>
                    <span aria-hidden>·</span>
                    <time>{formatDate(leadStory.publishedAt)}</time>
                    <span aria-hidden>·</span>
                    <span>{readingTime(leadStory.body)} min read</span>
                  </div>
                </div>
              </div>
            </Link>

            <aside className="flex flex-col gap-5 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
                  Trending
                </h2>
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
              {trending.map((a, i) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className="font-display text-xl font-extrabold text-line">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                    <Link
                      href={`/articles/${a.slug}`}
                      className="transition-colors hover:text-accent-strong"
                    >
                      {a.title}
                    </Link>
                  </h3>
                </div>
              ))}
            </aside>
          </div>
        ) : (
          <p className="py-16 text-center text-muted">No stories published yet.</p>
        )}
      </section>

      {/* Category sections */}
      <section className="grid divide-y divide-line gap-16 border-t border-line py-12">
        {categories.map((category, i) => {
          const items = categoryArticles[i] ?? [];
          if (!items.length) return null;
          const [first, ...rest] = items as ArticleCardData[];
          return (
            <div
              key={category.slug}
              className="grid gap-8 pt-12 lg:grid-cols-3 [&:first-child]:pt-0 pb-16"
            >
              <div>
                <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
                  <Link
                    href={`/category/${category.slug}`}
                    className="transition-colors hover:text-accent-strong"
                  >
                    {category.name}
                  </Link>
                </h2>
                {category.description && (
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {category.description}
                  </p>
                )}
                <Link
                  href={`/category/${category.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-accent-strong hover:underline"
                >
                  View all
                  <span aria-hidden>→</span>
                </Link>
              </div>

              <div className="border-t border-line lg:border-t-0">
                <ArticleCard article={first} />
              </div>

              <div className="flex flex-col gap-6 pt-6 lg:pt-0">
                {rest.map((a) => (
                  <ArticleCard key={a.slug} article={a} horizontal />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
