"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAccount } from "@/server/account";

export function DeleteAccountButton() {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirmDelete() {
    startTransition(async () => {
      setError(null);
      try {
        await deleteAccount();
        dialog.current?.close();
        router.push("/");
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-600 hover:text-white dark:border-red-700 dark:text-red-400"
      >
        Delete my account and data
      </button>

      <dialog
        ref={dialog}
        className="m-auto rounded-xl border border-line bg-paper p-6 text-ink shadow-xl backdrop:bg-black/50"
      >
        <h2 className="font-display text-lg font-bold">Delete your account?</h2>
        <p className="mt-2 max-w-sm text-sm text-muted">
          This permanently deletes your BuildWire account, all saved articles
          and followed topics. You&apos;ll need to create a new account to use
          them again.
        </p>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            disabled={pending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "Deleting…" : "Delete my account"}
          </button>
        </div>
      </dialog>
    </>
  );
}
