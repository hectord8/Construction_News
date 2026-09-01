import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import {
  getArticleBySlug,
  getRelatedArticles,
  getAllTags,
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Markdown } from "@/components/markdown";
import { ShareBar } from "@/components/share-bar";
import { TrackView } from "@/components/track-view";
import { ArticleCard } from "@/components/article-card";
import { formatDateLong, readingTime } from "@/lib/utils";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article not found" };

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt?.toISOString(),
      authors: [article.authorName],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, currentUser] = await Promise.all([
    getArticleBySlug(slug),
    getCurrentUser(),
  ]);

  if (!article) notFound();

  const saved = currentUser
    ? Boolean(
        await db.query.savedArticles.findFirst({
          where: (t, { and }) =>
            and(eq(t.userId, currentUser.id), eq(t.articleId, article.id)),
        }),
      )
    : false;

  const [related, allTags] = await Promise.all([
    getRelatedArticles(article.id, article.categorySlug, article.tags, 3),
    getAllTags(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    author: { "@type": "Person", name: article.authorName },
    publisher: { "@type": "Organization", name: "BuildWire" },
    mainEntityOfPage: `https://buildwire.news/articles/${article.slug}`,
    articleSection: article.category.name,
  };

  return (
    <div>
      <TrackView articleId={article.id} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <ShareBar
        articleId={article.id}
        title={article.title}
        saved={saved}
        signedIn={Boolean(currentUser)}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <header>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Link
              href={`/category/${article.categorySlug}`}
              className="text-sm font-semibold uppercase tracking-wider text-accent-strong hover:underline"
            >
              {article.category.name}
            </Link>
            {article.region && (
              <span className="rounded-full bg-line px-2.5 py-0.5 text-xs font-medium text-muted">
                {article.region}
              </span>
            )}
          </div>

          <h1 className="mt-4 font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {article.excerpt}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-line py-4 text-sm text-muted">
            <span className="font-semibold text-ink">{article.authorName}</span>
            <span aria-hidden>·</span>
            <time dateTime={article.publishedAt?.toISOString()}>
              {formatDateLong(article.publishedAt)}
            </time>
            <span aria-hidden>·</span>
            <span>{readingTime(article.body)} min read</span>
            {article.viewCount > 0 && (
              <>
                <span aria-hidden>·</span>
                <span>{article.viewCount.toLocaleString()} views</span>
              </>
            )}
          </div>
        </header>

        {article.coverImage && (
          <div className="my-8 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-auto w-full object-cover"
            />
          </div>
        )}

        <div className="py-8">
          <Markdown>{article.body}</Markdown>
        </div>

        <footer>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((slug) => {
              const tag = allTags.find((t) => t.slug === slug);
              return (
                <Link
                  key={slug}
                  href={`/tag/${slug}`}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-accent/40 hover:text-accent-strong"
                >
                  #{tag?.name ?? slug}
                </Link>
              );
            })}
          </div>
        </footer>
      </div>

      {related.length > 0 && (
        <section className="border-t border-line bg-background">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
            <h2 className="font-display text-xl font-extrabold tracking-tight text-ink">
              Related stories
            </h2>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((a) => (
                <ArticleCard
                  key={a.slug}
                  article={{
                    ...a,
                    categoryName: a.category.name,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
