import type { Metadata } from "next";
import { getCategories, searchArticles } from "@/lib/queries";
import { ArticleCard } from "@/components/article-card";
import { SearchForm } from "@/components/search-form";

export const metadata: Metadata = {
  title: "Search",
  description: "Search BuildWire for construction industry news.",
};

type Props = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    region?: string;
    from?: string;
    to?: string;
  }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const categories = await getCategories();

  const result = await searchArticles({
    query: q || undefined,
    category: sp.category || undefined,
    region: sp.region || undefined,
    from: sp.from || undefined,
    to: sp.to || undefined,
    limit: 30,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          Search
        </h1>
        <p className="mt-2 text-muted">
          Find stories across every section of BuildWire.
        </p>
      </header>

      <SearchForm
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        initial={{
          q,
          category: sp.category ?? "",
          region: sp.region ?? "",
          from: sp.from ?? "",
          to: sp.to ?? "",
        }}
      />

      <section className="mt-10">
        <div className="mb-6 flex items-center justify-between border-b border-line pb-4">
          <h2 className="font-display text-lg font-bold text-ink">
            {q
              ? `Results for "${q}"`
              : result.total
                ? "Latest stories"
                : "All stories"}
          </h2>
          <span className="text-sm text-muted">
            {result.total} result{result.total === 1 ? "" : "s"}
          </span>
        </div>

        {result.results.length ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {result.results.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-line py-20 text-center">
            <p className="font-display text-lg font-semibold text-ink">
              No matches found
            </p>
            <p className="mt-2 text-sm text-muted">
              Try a different keyword or widen your date range.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
