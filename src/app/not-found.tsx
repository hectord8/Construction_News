import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="font-display text-sm font-bold uppercase tracking-widest text-accent-strong">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try the latest stories instead.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-md bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
      >
        Back to the newsroom
      </Link>
    </div>
  );
}
