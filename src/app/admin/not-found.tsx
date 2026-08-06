import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-sm font-bold uppercase tracking-widest text-accent-strong">
        404
      </p>
      <h2 className="mt-3 font-display text-2xl font-extrabold text-ink">
        Not found in the studio
      </h2>
      <p className="mt-2 text-sm text-muted">
        This admin page doesn&apos;t exist.
      </p>
      <Link
        href="/admin"
        className="mt-6 inline-block text-sm font-semibold text-accent-strong hover:underline"
      >
        Back to overview →
      </Link>
    </div>
  );
}
