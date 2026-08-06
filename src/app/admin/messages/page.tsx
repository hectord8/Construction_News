import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { MessageItem } from "@/components/admin/message-item";

export default async function AdminMessagesPage() {
  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(200);

  const unread = messages.filter((m) => !m.isRead).length;

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">Messages</h2>
      <p className="mt-1 text-sm text-muted">
        {unread} unread · {messages.length} total
      </p>

      <div className="mt-6 space-y-3">
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} />
        ))}
        {!messages.length && (
          <p className="rounded-xl border border-dashed border-line p-12 text-center text-muted">
            No messages yet.
          </p>
        )}
      </div>
    </div>
  );
}
