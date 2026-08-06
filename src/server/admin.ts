"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  articleTags,
  articles,
  categories,
  contactMessages,
  newsletterSubscribers,
  tags,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export type ActionResult = { ok: boolean; message: string; id?: string };

const articleSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().min(3).max(200),
  excerpt: z.string().min(20).max(500),
  body: z.string().min(20),
  categorySlug: z.string(),
  coverImage: z.string().max(2000).nullable(),
  region: z.string().max(100).nullable(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean(),
  leadStory: z.boolean(),
  authorName: z.string().min(1).max(100),
  tagSlugs: z.array(z.string()).max(10),
});

export async function saveArticle(
  id: string | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const raw = {
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    body: formData.get("body"),
    categorySlug: formData.get("categorySlug"),
    coverImage: formData.get("coverImage") || null,
    region: formData.get("region") || null,
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    leadStory: formData.get("leadStory") === "on",
    authorName: formData.get("authorName"),
    tagSlugs: formData.getAll("tagSlugs") as string[],
  };

  const slugInput = String(formData.get("slug") ?? "");
  const slug = slugInput.trim() ? slugInput : slugify(String(raw.title));
  const parsed = articleSchema.safeParse({ ...raw, slug });

  if (!parsed.success) {
    return { ok: false, message: "Please fix the form errors and try again." };
  }

  const data = parsed.data;

  if (id) {
    await db
      .update(articles)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        categorySlug: data.categorySlug,
        coverImage: data.coverImage,
        region: data.region,
        status: data.status,
        featured: data.featured,
        leadStory: data.leadStory,
        authorName: data.authorName,
        publishedAt:
          data.status === "published"
            ? new Date()
            : undefined,
        updatedAt: new Date(),
      })
      .where(eq(articles.id, id));

    await db.delete(articleTags).where(eq(articleTags.articleId, id));

    for (const tagSlug of data.tagSlugs) {
      await db.insert(tags).values({ slug: tagSlug, name: tagSlug }).onConflictDoNothing();
      await db.insert(articleTags).values({ articleId: id, tagSlug });
    }

    revalidatePath("/admin/articles");
    revalidatePath(`/articles/${data.slug}`);
    revalidatePath("/");
    return { ok: true, message: "Article saved.", id };
  }

  const [created] = await db
    .insert(articles)
    .values({
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt,
      body: data.body,
      categorySlug: data.categorySlug,
      coverImage: data.coverImage,
      region: data.region,
      status: data.status,
      featured: data.featured,
      leadStory: data.leadStory,
      authorName: data.authorName,
      publishedAt: data.status === "published" ? new Date() : null,
    })
    .returning({ id: articles.id });

  if (!created) return { ok: false, message: "Could not create article." };

  for (const tagSlug of data.tagSlugs) {
    await db.insert(tags).values({ slug: tagSlug, name: tagSlug }).onConflictDoNothing();
    await db.insert(articleTags).values({ articleId: created.id, tagSlug });
  }

  revalidatePath("/admin/articles");
  revalidatePath("/");
  return { ok: true, message: "Article created.", id: created.id };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(articles).where(eq(articles.id, id));
  revalidatePath("/admin/articles");
  revalidatePath("/");
  return { ok: true, message: "Article deleted." };
}

export async function saveCategory(formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const slug = String(formData.get("slug"));
  const name = String(formData.get("name"));
  const description = String(formData.get("description") ?? "");
  const order = Number(formData.get("order") ?? 0);

  if (!slug || !name) return { ok: false, message: "Slug and name required." };

  await db
    .insert(categories)
    .values({ slug, name, description: description || null, order })
    .onConflictDoUpdate({
      target: categories.slug,
      set: { name, description: description || null, order },
    });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true, message: "Category saved." };
}

export async function deleteCategory(slug: string): Promise<ActionResult> {
  await requireAdmin();
  try {
    await db.delete(categories).where(eq(categories.slug, slug));
  } catch {
    return {
      ok: false,
      message: "Cannot delete: category still has articles.",
    };
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
  return { ok: true, message: "Category deleted." };
}

export async function toggleMessageRead(id: string): Promise<ActionResult> {
  await requireAdmin();
  const msg = await db.query.contactMessages.findFirst({
    where: eq(contactMessages.id, id),
  });
  if (!msg) return { ok: false, message: "Message not found." };
  await db
    .update(contactMessages)
    .set({ isRead: !msg.isRead })
    .where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
  return { ok: true, message: "Updated." };
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.delete(contactMessages).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
  return { ok: true, message: "Message deleted." };
}

export async function unsubscribeSubscriber(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed" })
    .where(eq(newsletterSubscribers.id, id));
  revalidatePath("/admin/subscribers");
  return { ok: true, message: "Unsubscribed." };
}
