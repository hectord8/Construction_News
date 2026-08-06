import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";
import { DeleteArticleButton } from "@/components/admin/delete-article-button";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminArticlesPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const rows = await db.query.articles.findMany({
    with: { category: true },
    orderBy: desc(articles.updatedAt),
    where: status === "draft" || status === "published"
      ? eq(articles.status, status)
      : undefined,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-ink">Articles</h2>
        <div className="flex flex-wrap items-center gap-2">
          {["all", "published", "draft"].map((s) => (
            <Link
              key={s}
              href={s === "all" ? "/admin/articles" : `/admin/articles?status=${s}`}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                (status ?? "all") === s
                  ? "bg-charcoal text-white"
                  : "bg-line/60 text-muted hover:text-ink"
              }`}
            >
              {s}
            </Link>
          ))}
          <Link
            href="/admin/articles/new"
            className="ml-2 rounded-md bg-accent px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            + New article
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-background text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">
                Category
              </th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                Status
              </th>
              <th className="hidden px-4 py-3 font-semibold lg:table-cell">
                Views
              </th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/articles/${a.id}`}
                    className="font-medium text-ink hover:text-accent-strong"
                  >
                    {a.title}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">
                  {a.category.name}
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
                <td className="hidden px-4 py-3 text-muted lg:table-cell">
                  {a.viewCount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/admin/articles/${a.id}`}
                      className="text-xs font-semibold text-accent-strong hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteArticleButton id={a.id} />
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted"
                >
                  No articles match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
