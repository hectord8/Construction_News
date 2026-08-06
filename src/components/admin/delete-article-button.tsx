"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteArticle } from "@/server/admin";

export function DeleteArticleButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteArticle(id);
              router.refresh();
            })
          }
          className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-60"
        >
          {pending ? "…" : "Confirm"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-muted hover:underline"
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-xs font-semibold text-muted hover:text-red-600"
    >
      Delete
    </button>
  );
}
