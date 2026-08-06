"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  articles,
  followedCategories,
  newsletterSubscribers,
  savedArticles,
} from "@/lib/db/schema";
import { requireUser } from "@/lib/auth";

export type ActionResult = {
  ok: boolean;
  error?: string;
  saved?: boolean;
  followed?: boolean;
};

export async function toggleSaveArticle(
  articleId: string,
): Promise<ActionResult> {
  const user = await requireUser();

  const existing = await db.query.savedArticles.findFirst({
    where: (t, { and }) =>
      and(eq(t.userId, user.id), eq(t.articleId, articleId)),
  });

  if (existing) {
    await db
      .delete(savedArticles)
      .where(eq(savedArticles.articleId, articleId));
    revalidatePath("/dashboard");
    return { ok: true, saved: false };
  }

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, articleId),
  });
  if (!article) return { ok: false, error: "Article not found" };

  await db.insert(savedArticles).values({
    userId: user.id,
    articleId,
  });
  revalidatePath("/dashboard");
  return { ok: true, saved: true };
}

export async function toggleFollowCategory(
  categorySlug: string,
): Promise<ActionResult> {
  const user = await requireUser();

  const existing = await db.query.followedCategories.findFirst({
    where: (t, { and }) =>
      and(eq(t.userId, user.id), eq(t.categorySlug, categorySlug)),
  });

  if (existing) {
    await db
      .delete(followedCategories)
      .where(
        and(
          eq(followedCategories.userId, user.id),
          eq(followedCategories.categorySlug, categorySlug),
        ),
      );
    revalidatePath("/dashboard");
    return { ok: true, followed: false };
  }

  await db.insert(followedCategories).values({
    userId: user.id,
    categorySlug,
  });
  revalidatePath("/dashboard");
  return { ok: true, followed: true };
}

export async function unsubscribeNewsletter(
  token: string,
): Promise<ActionResult> {
  await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed" })
    .where(eq(newsletterSubscribers.token, token));
  return { ok: true };
}
