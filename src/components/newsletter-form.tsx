"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/server/forms";

export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(
    (_: unknown, fd: FormData) => subscribeNewsletter(fd),
    null,
  );

  return (
    <form action={action} className="w-full max-w-md">
      <div className="flex gap-2">
        <input
          type="email"
          name="email"
          required
          placeholder="you@company.com"
          className="w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "…" : "Subscribe"}
        </button>
      </div>
      {state && (
        <p
          className={`mt-2 text-sm ${
            state.ok ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      )}
      {!compact && (
        <p className="mt-2 text-xs text-muted">
          A weekly digest of the top stories in construction. Unsubscribe
          anytime.
        </p>
      )}
    </form>
  );
}
