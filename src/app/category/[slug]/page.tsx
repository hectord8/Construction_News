import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCategory, getArticlesByCategory } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ArticleCard } from "@/components/article-card";
import { FollowCategoryButton } from "@/components/follow-button";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
};

const PER_PAGE = 12;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  return {
    title: category ? `${category.name} News` : "Category",
    description: category?.description ?? undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [category, currentUser] = await Promise.all([
    getCategory(slug),
    getCurrentUser(),
  ]);
  if (!category) notFound();

  const [items, followed] = await Promise.all([
    getArticlesByCategory(slug, {
      limit: PER_PAGE,
      offset: (currentPage - 1) * PER_PAGE,
    }),
    currentUser
      ? db.query.followedCategories.findFirst({
          where: (t, { and }) =>
            and(eq(t.userId, currentUser.id), eq(t.categorySlug, slug)),
        })
      : Promise.resolve(null),
  ]);

  const hasMore = items.length === PER_PAGE;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <header className="border-b border-line pb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
              Category
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
              {category.name}
            </h1>
            {category.description && (
              <p className="mt-3 text-base leading-relaxed text-muted">
                {category.description}
              </p>
            )}
          </div>
          <FollowCategoryButton
            categorySlug={slug}
            initialFollowed={Boolean(followed)}
            isSignedIn={Boolean(currentUser)}
          />
        </div>
      </header>

      <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((a) => (
          <ArticleCard
            key={a.slug}
            article={{ ...a, categoryName: category.name }}
          />
        ))}
      </div>

      {!items.length && (
        <p className="py-16 text-center text-muted">
          No published stories in this category yet.
        </p>
      )}

      <nav className="flex items-center justify-center gap-4 border-t border-line pt-8">
        {currentPage > 1 && (
          <Link
            href={`/category/${slug}?page=${currentPage - 1}`}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:text-accent-strong"
          >
            ← Previous
          </Link>
        )}
        {hasMore && (
          <Link
            href={`/category/${slug}?page=${currentPage + 1}`}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:text-accent-strong"
          >
            Next →
          </Link>
        )}
      </nav>
    </div>
  );
}
