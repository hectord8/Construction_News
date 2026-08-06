import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticlesByTag, getAllTags } from "@/lib/queries";
import { ArticleCard } from "@/components/article-card";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tags = await getAllTags();
  const tag = tags.find((t) => t.slug === slug);
  return {
    title: tag ? `#${tag.name}` : "Tag",
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;
  const [articles, tags] = await Promise.all([
    getArticlesByTag(slug),
    getAllTags(),
  ]);
  const tag = tags.find((t) => t.slug === slug);
  if (!tag) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="border-b border-line pb-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink">
          <span className="text-accent-strong">#</span>
          {tag.name}
        </h1>
        <p className="mt-3 text-muted">
          {articles.length} article{articles.length === 1 ? "" : "s"} tagged{" "}
          {tag.name}.
        </p>
      </header>

      <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {articles.map((a) => (
          <ArticleCard key={a.slug} article={a} />
        ))}
      </div>

      {!articles.length && (
        <p className="py-16 text-center text-muted">
          No published stories with this tag yet.
        </p>
      )}

      <section className="border-t border-line pt-10">
        <h2 className="font-display text-sm font-bold uppercase tracking-wider text-ink">
          All tags
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.slug}
              href={`/tag/${t.slug}`}
              className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent-strong"
            >
              #{t.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
