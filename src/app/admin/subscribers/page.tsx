import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { newsletterSubscribers } from "@/lib/db/schema";
import { UnsubscribeButton } from "@/components/admin/unsubscribe-button";

export default async function AdminSubscribersPage() {
  const subscribers = await db
    .select()
    .from(newsletterSubscribers)
    .orderBy(desc(newsletterSubscribers.createdAt))
    .limit(500);

  const active = subscribers.filter((s) => s.status === "subscribed").length;

  const csv = [
    ["email", "status", "subscribed_at"].join(","),
    ...subscribers.map((s) =>
      [s.email, s.status, s.createdAt.toISOString()].join(","),
    ),
  ].join("\n");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-ink">
            Newsletter subscribers
          </h2>
          <p className="mt-1 text-sm text-muted">
            {active} active · {subscribers.length} total
          </p>
        </div>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`}
          download="buildwire-subscribers.csv"
          className="rounded-md bg-charcoal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-charcoal/90"
        >
          Export CSV
        </a>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-paper">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-background text-xs uppercase tracking-wider text-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">
                Status
              </th>
              <th className="hidden px-4 py-3 font-semibold md:table-cell">
                Subscribed
              </th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {subscribers.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-ink">{s.email}</td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span
                    className={
                      s.status === "subscribed"
                        ? "text-emerald-600"
                        : "text-muted"
                    }
                  >
                    {s.status}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-muted md:table-cell">
                  {s.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  {s.status === "subscribed" && (
                    <UnsubscribeButton id={s.id} />
                  )}
                </td>
              </tr>
            ))}
            {!subscribers.length && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-muted">
                  No subscribers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
