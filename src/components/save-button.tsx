"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleSaveArticle } from "@/server/actions";
import { cn } from "@/lib/utils";

export function SaveButton({
  articleId,
  initialSaved = false,
  isSignedIn = false,
  variant = "default",
}: {
  articleId: string;
  initialSaved?: boolean;
  isSignedIn?: boolean;
  variant?: "default" | "quiet";
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    startTransition(async () => {
      const res = await toggleSaveArticle(articleId);
      if (res.ok && res.saved !== undefined) setSaved(res.saved);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={saved}
      title={saved ? "Remove from saved" : "Save article"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border text-sm font-medium transition-colors disabled:opacity-60",
        variant === "quiet"
          ? "border-line px-3 py-1.5 text-muted hover:border-accent/40 hover:text-accent-strong"
          : "border-line px-3 py-2 text-ink hover:border-accent/40 hover:text-accent-strong",
        saved && "border-accent/40 bg-accent/5 text-accent-strong",
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      <span className={variant === "quiet" ? "sr-only" : undefined}>
        {saved ? "Saved" : "Save"}
      </span>
    </button>
  );
}
