"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import {
  followedCategories,
  savedArticles,
  users,
} from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";

export type FormResult = {
  ok: boolean;
  message: string;
};

export async function deleteAccount(): Promise<FormResult> {
  const user = await requireUser();

  try {
    await (await clerkClient()).users.deleteUser(user.clerkId);
  } catch {
    // Clerk account may already be gone — still clean up local data.
  }

  await db.delete(savedArticles).where(eq(savedArticles.userId, user.id));
  await db
    .delete(followedCategories)
    .where(eq(followedCategories.userId, user.id));
  await db.delete(users).where(eq(users.id, user.id));

  revalidatePath("/dashboard");
  redirect("/");
}
