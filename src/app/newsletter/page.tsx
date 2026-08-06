import type { Metadata } from "next";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "Newsletter",
  description:
    "Get the BuildWire weekly digest — the top stories in construction, delivered to your inbox.",
};

export default function NewsletterPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
          Newsletter
        </p>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          The BuildWire Digest
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-muted">
          A weekly email with the biggest stories in construction: projects in
          the pipeline, rule changes that matter, and the technology
          reshaping how we build. Free, no noise.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <NewsletterForm />
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          ["Weekly", "One email, every week. No spam."],
          ["Curated", "The stories that actually matter."],
          ["Free forever", "Unsubscribe in one click."],
        ].map(([title, text]) => (
          <div
            key={title}
            className="rounded-xl border border-line bg-paper p-5"
          >
            <p className="font-display text-sm font-bold text-ink">{title}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
