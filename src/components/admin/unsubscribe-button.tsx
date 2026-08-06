"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { unsubscribeSubscriber } from "@/server/admin";

export function UnsubscribeButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await unsubscribeSubscriber(id);
          router.refresh();
        })
      }
      className="text-xs font-semibold text-muted hover:text-red-600 disabled:opacity-60"
    >
      {pending ? "…" : "Unsubscribe"}
    </button>
  );
}
