"use client";

import { useActionState } from "react";
import { submitContact } from "@/server/forms";

const field =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent";

export function ContactForm() {
  const [state, action, pending] = useActionState(
    (_: unknown, fd: FormData) => submitContact(fd),
    null,
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">Name</span>
          <input name="name" required minLength={2} className={field} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Email
          </span>
          <input name="email" type="email" required className={field} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">
          Subject
        </span>
        <input name="subject" className={field} placeholder="Advertise, tip a story, feedback…" />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted">
          Message
        </span>
        <textarea
          name="body"
          required
          minLength={10}
          rows={6}
          className={field}
        />
      </label>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
        {state && (
          <p
            className={`text-sm ${
              state.ok ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
