"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { REGIONS } from "@/lib/regions";

export function SearchForm({
  categories,
  initial,
}: {
  categories: { slug: string; name: string }[];
  initial: {
    q: string;
    category: string;
    region: string;
    from: string;
    to: string;
  };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (form.q.trim()) params.set("q", form.q.trim());
    if (form.category) params.set("category", form.category);
    if (form.region) params.set("region", form.region);
    if (form.from) params.set("from", form.from);
    if (form.to) params.set("to", form.to);
    startTransition(() => router.push(`/search?${params.toString()}`));
  }

  function clear() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("region");
    params.delete("from");
    params.delete("to");
    router.push(`/search?${params.toString()}`);
  }

  const field =
    "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <input
            type="search"
            name="q"
            value={form.q}
            onChange={(e) => setForm({ ...form, q: e.target.value })}
            placeholder="Search construction news…"
            className={`${field} pr-10`}
          />
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending ? "Searching…" : "Search"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Category
          </span>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className={field}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            Region
          </span>
          <select
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
            className={field}
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            From
          </span>
          <input
            type="date"
            value={form.from}
            onChange={(e) => setForm({ ...form, from: e.target.value })}
            className={field}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted">
            To
          </span>
          <input
            type="date"
            value={form.to}
            onChange={(e) => setForm({ ...form, to: e.target.value })}
            className={field}
          />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">
          Tip: use keywords like &ldquo;fall protection&rdquo; or
          &ldquo;mass timber&rdquo;
        </span>
        <button
          type="button"
          onClick={clear}
          className="text-xs font-medium text-accent-strong hover:underline"
        >
          Clear filters
        </button>
      </div>
    </form>
  );
}
