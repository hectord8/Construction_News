"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteMessage, toggleMessageRead } from "@/server/admin";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  body: string;
  isRead: boolean;
  createdAt: Date;
};

export function MessageItem({ message }: { message: Message }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <article
      className={cn(
        "rounded-xl border bg-paper p-5",
        message.isRead ? "border-line" : "border-accent/40",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-ink">{message.subject}</h3>
          {!message.isRead && (
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-strong">
              New
            </span>
          )}
        </div>
        <span className="text-xs text-muted">
          {message.createdAt.toLocaleString()}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted">
        From {message.name} ·{" "}
        <a
          href={`mailto:${message.email}`}
          className="text-accent-strong hover:underline"
        >
          {message.email}
        </a>
      </p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">
        {message.body}
      </p>
      <div className="mt-4 flex gap-4 text-xs">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await toggleMessageRead(message.id);
              router.refresh();
            })
          }
          className="font-semibold text-accent-strong hover:underline disabled:opacity-60"
        >
          Mark {message.isRead ? "unread" : "read"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteMessage(message.id);
              router.refresh();
            })
          }
          className="font-semibold text-muted hover:text-red-600 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
