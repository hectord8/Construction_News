"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleFollowCategory } from "@/server/actions";
import { cn } from "@/lib/utils";

export function FollowCategoryButton({
  categorySlug,
  initialFollowed = false,
  isSignedIn = false,
  className,
}: {
  categorySlug: string;
  initialFollowed?: boolean;
  isSignedIn?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const [followed, setFollowed] = useState(initialFollowed);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    startTransition(async () => {
      const res = await toggleFollowCategory(categorySlug);
      if (res.ok && res.followed !== undefined) setFollowed(res.followed);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={followed}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60",
        followed
          ? "border-accent/40 bg-accent/5 text-accent-strong"
          : "border-line text-ink hover:border-accent/40 hover:text-accent-strong",
        className,
      )}
    >
      {followed ? (
        <>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Following
        </>
      ) : (
        <>
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>
          Follow
        </>
      )}
    </button>
  );
}
