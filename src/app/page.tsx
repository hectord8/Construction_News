import Link from "next/link";
import type { Metadata } from "next";
import {
  getCategories,
  getArticlesByCategory,
  getLeadStory,
  getTrendingArticles,
  getMaterialPrices,
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
  const [leadStory, categories, trending, prices] = await Promise.all([
    getLeadStory(),
    getCategories(),
    getTrendingArticles(6),
    getMaterialPrices(),
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
              <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-charcoal text-white">
                {leadStory.coverImage && (
                  <div className="absolute inset-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={leadStory.coverImage}
                      alt={leadStory.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />
                  </div>
                )}
                <div className="relative z-10 flex h-full flex-col justify-between gap-6 p-6 sm:p-8">
                  <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-white/80">
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
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/80">
                      {leadStory.excerpt}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/70">
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
                  <div className="flex-1">
                    {a.coverImage && (
                      <Link href={`/articles/${a.slug}`} className="mb-2 block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={a.coverImage}
                          alt={a.title}
                          className="h-20 w-full rounded-lg object-cover"
                        />
                      </Link>
                    )}
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">
                      <Link
                        href={`/articles/${a.slug}`}
                        className="transition-colors hover:text-accent-strong"
                      >
                        {a.title}
                      </Link>
                    </h3>
                  </div>
                </div>
              ))}
            </aside>
          </div>
        ) : (
          <p className="py-16 text-center text-muted">No stories published yet.</p>
        )}
      </section>

      {/* Material Prices */}
      {prices.length > 0 && (
        <section className="border-t border-line py-12">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-extrabold tracking-tight text-ink">
              Material Prices
            </h2>
            <Link
              href="/prices"
              className="text-sm font-semibold text-accent-strong hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {prices.slice(0, 6).map((d) => {
              const momPct = d.momPct;
              const momColor =
                momPct === null
                  ? "text-muted"
                  : momPct > 0
                    ? "text-red-600"
                    : momPct < 0
                      ? "text-green-600"
                      : "text-muted";
              const momText =
                momPct === null
                  ? "—"
                  : `${momPct > 0 ? "+" : ""}${momPct.toFixed(1)}%`;
              return (
                <div
                  key={d.material.id}
                  className="rounded-xl border border-line bg-paper p-4"
                >
                  <div className="text-xs font-medium uppercase tracking-wider text-muted">
                    {d.material.category}
                  </div>
                  <div className="mt-1 font-medium text-ink">
                    {d.material.name}
                  </div>
                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="font-display text-2xl font-extrabold text-ink">
                      {d.latestIndex !== null
                        ? d.latestIndex.toFixed(1)
                        : "—"}
                    </span>
                    <span className={`text-sm font-semibold ${momColor}`}>
                      {momText}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    Index (2015=100)
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
