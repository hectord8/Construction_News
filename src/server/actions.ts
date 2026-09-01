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
import { slugSchema } from "@/lib/validation";
import { z } from "zod";

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
  if (!z.uuid().safeParse(articleId).success) {
    return { ok: false, error: "Article not found" };
  }

  const existing = await db.query.savedArticles.findFirst({
    where: (t, { and }) =>
      and(eq(t.userId, user.id), eq(t.articleId, articleId)),
  });

  if (existing) {
    await db
      .delete(savedArticles)
      .where(
        and(
          eq(savedArticles.userId, user.id),
          eq(savedArticles.articleId, articleId),
        ),
      );
    revalidatePath("/dashboard");
    return { ok: true, saved: false };
  }

  const article = await db.query.articles.findFirst({
    where: eq(articles.id, articleId),
  });
  if (!article || article.status !== "published") {
    return { ok: false, error: "Article not found" };
  }

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
  if (!slugSchema.safeParse(categorySlug).success) {
    return { ok: false, error: "Category not found" };
  }

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

  const category = await db.query.categories.findFirst({
    where: (t, { eq }) => eq(t.slug, categorySlug),
  });
  if (!category) return { ok: false, error: "Category not found" };

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
  if (!z.uuid().safeParse(token).success) {
    return { ok: false, error: "Invalid unsubscribe link" };
  }
  await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed" })
    .where(eq(newsletterSubscribers.token, token));
  return { ok: true };
}
