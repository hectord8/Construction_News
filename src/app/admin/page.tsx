import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  articles,
  contactMessages,
  newsletterSubscribers,
} from "@/lib/db/schema";
import { getCategories } from "@/lib/queries";

export default async function AdminOverview() {
  const [allArticles, published, drafts, subscribers, messages, categories] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(articles),
      db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.status, "published")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(articles)
        .where(eq(articles.status, "draft")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(newsletterSubscribers)
        .where(eq(newsletterSubscribers.status, "subscribed")),
      db
        .select({ count: sql<number>`count(*)` })
        .from(contactMessages)
        .where(eq(contactMessages.isRead, false)),
      getCategories(),
    ]);

  const [recent] = await Promise.all([
    db.query.articles.findMany({
      columns: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: desc(articles.updatedAt),
      limit: 6,
    }),
  ]);

  const stats = [
    { label: "Total articles", value: Number(allArticles[0]?.count ?? 0) },
    { label: "Published", value: Number(published[0]?.count ?? 0) },
    { label: "Drafts", value: Number(drafts[0]?.count ?? 0) },
    {
      label: "Subscribers",
      value: Number(subscribers[0]?.count ?? 0),
    },
    {
      label: "Unread messages",
      value: Number(messages[0]?.count ?? 0),
    },
    { label: "Categories", value: categories.length },
  ];

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-paper p-4">
            <p className="font-display text-3xl font-extrabold text-ink">
              {s.value}
            </p>
            <p className="mt-1 text-xs font-medium text-muted">{s.label}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-ink">
            Recently updated
          </h2>
          <Link
            href="/admin/articles"
            className="text-sm font-semibold text-accent-strong hover:underline"
          >
            All articles →
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-paper">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line bg-background text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Title</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                  Status
                </th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">
                  Published
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {recent.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="font-medium text-ink hover:text-accent-strong"
                    >
                      {a.title}
                    </Link>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={
                        a.status === "published"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">
                    {a.publishedAt
                      ? a.publishedAt.toLocaleDateString()
                      : a.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!recent.length && (
                <tr>
                  <td className="px-4 py-8 text-center text-muted">
                    No articles yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
