import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";

// UUID v4 validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    articleId?: string;
  } | null;
  const articleId = body?.articleId;

  if (!articleId || typeof articleId !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Validate UUID format
  if (!UUID_REGEX.test(articleId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const updated = await db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(
      and(eq(articles.id, articleId), eq(articles.status, "published")),
    )
    .returning({ id: articles.id });

  return NextResponse.json({ ok: updated.length > 0 });
}
