import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { followedCategories, savedArticles } from "@/lib/db/schema";
import { getCategories } from "@/lib/queries";
import { ArticleCard } from "@/components/article-card";
import { FollowCategoryButton } from "@/components/follow-button";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/dashboard");

  const admin = await isAdmin();

  const [saved, follows, categories] = await Promise.all([
    db.query.savedArticles.findMany({
      where: eq(savedArticles.userId, user.id),
      with: {
        article: {
          with: { category: true, tags: { with: { tag: true } } },
        },
      },
      orderBy: desc(savedArticles.createdAt),
    }),
    db.query.followedCategories.findMany({
      where: eq(followedCategories.userId, user.id),
    }),
    getCategories(),
  ]);

  const savedArticlesData = saved.map((s) => ({
    ...s.article,
    tags: s.article.tags.map((t) => t.tag.slug),
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
            Dashboard
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink">
            Welcome back, {user.name.split(" ")[0]}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {admin && (
            <Link
              href="/admin"
              className="rounded-md bg-charcoal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-charcoal/90"
            >
              Admin
            </Link>
          )}
          <Link
            href="/dashboard/settings"
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent/40 hover:text-accent-strong"
          >
            Settings
          </Link>
        </div>
      </header>

      <section className="py-8">
        <h2 className="font-display text-lg font-bold text-ink">
          Saved articles{" "}
          <span className="text-sm font-normal text-muted">
            ({savedArticlesData.length})
          </span>
        </h2>
        {savedArticlesData.length ? (
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {savedArticlesData.map((a) => (
              <ArticleCard
                key={a.slug}
                article={{ ...a, categoryName: a.category.name }}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-line py-12 text-center">
            <p className="text-sm text-muted">No saved articles yet.</p>
            <Link
              href="/"
              className="mt-2 inline-block text-sm font-semibold text-accent-strong hover:underline"
            >
              Browse the latest stories →
            </Link>
          </div>
        )}
      </section>

      <section className="border-t border-line py-8">
        <h2 className="font-display text-lg font-bold text-ink">
          Followed topics{" "}
          <span className="text-sm font-normal text-muted">
            ({follows.length})
          </span>
        </h2>
        <div className="mt-6 flex flex-wrap gap-3">
          {categories.map((c) => {
            const isFollowed = follows.some((f) => f.categorySlug === c.slug);
            return (
              <div
                key={c.slug}
                className="flex items-center gap-3 rounded-xl border border-line bg-paper py-2 pl-4 pr-2"
              >
                <Link
                  href={`/category/${c.slug}`}
                  className="text-sm font-semibold text-ink hover:text-accent-strong"
                >
                  {c.name}
                </Link>
                <FollowCategoryButton
                  categorySlug={c.slug}
                  initialFollowed={isFollowed}
                  isSignedIn
                />
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
