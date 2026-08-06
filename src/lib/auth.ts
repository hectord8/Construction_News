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

export const getCurrentUser = cache(async () => {
  if (!hasClerkKeys) return null;

  const session = await auth();
  if (!session.userId) return null;

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, session.userId),
  });

  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [created] = await db
    .insert(users)
    .values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
      name: clerkUser.fullName ?? "BuildWire Reader",
      imageUrl: clerkUser.imageUrl,
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
  if (user.role !== "admin") {
    throw new Error("Administrator access required");
  }
  return user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin";
}
