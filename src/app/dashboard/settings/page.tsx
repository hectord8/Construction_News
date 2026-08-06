import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { getCurrentUser } from "@/lib/auth";
import { DeleteAccountButton } from "@/components/delete-account-button";

export const metadata: Metadata = {
  title: "Account Settings",
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirect_url=/dashboard/settings");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
        Account settings
      </h1>
      <p className="mt-2 text-muted">
        Manage your profile, email and security with BuildWire.
      </p>

      <div className="mt-8 rounded-xl border border-line bg-paper p-6">
        <UserProfile />
      </div>

      <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <h2 className="font-display text-lg font-bold text-red-700 dark:text-red-400">
          Delete account
        </h2>
        <p className="mt-1 text-sm text-red-600 dark:text-red-400/80">
          Permanently deletes your BuildWire account, saved articles and
          followed topics. This cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  );
}
