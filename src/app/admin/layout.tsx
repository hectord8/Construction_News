import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  if (!admin) redirect("/");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between border-b border-line pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-accent-strong">
            Admin
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink">
            BuildWire Studio
          </h1>
        </div>
        <Link
          href="/admin/articles/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong"
        >
          New article
        </Link>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <AdminNav />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
