import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { articleId?: string } | null;
  const articleId = body?.articleId;
  if (!articleId || typeof articleId !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  await db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, articleId));
  return NextResponse.json({ ok: true });
}
