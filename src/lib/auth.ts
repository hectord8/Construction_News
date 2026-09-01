import "server-only";

import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { users } from "./db/schema";

export const hasClerkKeys = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY,
);

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAdminEmail(email: string) {
  return adminEmails.includes(email.toLowerCase());
}

export const getCurrentUser = cache(async () => {
  if (!hasClerkKeys) return null;

  const session = await auth();
  if (!session.userId) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, session.userId),
  });

  if (existing) {
    if (isAdminEmail(existing.email) && existing.role !== "admin") {
      const [updated] = await db
        .update(users)
        .set({ role: "admin" })
        .where(eq(users.id, existing.id))
        .returning();
      if (updated) return updated;
    }
    if (!isAdminEmail(existing.email) && existing.role === "admin") {
      const [updated] = await db
        .update(users)
        .set({ role: "user" })
        .where(eq(users.id, existing.id))
        .returning();
      if (updated) return updated;
    }
    return existing;
  }

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail = clerkUser.emailAddresses.find(
    (address) => address.id === clerkUser.primaryEmailAddressId,
  );
  const email = primaryEmail?.emailAddress ?? "";
  const verified = primaryEmail?.verification?.status === "verified";
  const [created] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email,
      name: clerkUser.fullName ?? "BuildWire Reader",
      imageUrl: clerkUser.imageUrl,
      role: isAdminEmail(email) && verified ? "admin" : "user",
    })
    .onConflictDoNothing({ target: users.clerkId })
    .returning();

  if (created) return created;

  return db.query.users.findFirst({ where: eq(users.clerkId, session.userId) });
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin" || !isAdminEmail(user.email)) {
    throw new Error("Administrator access required");
  }
  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
