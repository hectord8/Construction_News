"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-display text-sm font-bold uppercase tracking-widest text-accent-strong">
        Something went wrong
      </p>
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        We hit a snag in the press room
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        An unexpected error occurred while rendering this page. You can try
        again, or head back to the homepage.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-md border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent/40 hover:text-accent-strong"
        >
          Go home
        </a>
      </div>
    </div>
  );
}
