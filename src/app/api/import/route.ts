import { NextResponse } from "next/server";
import { runRssImport } from "@/lib/import";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = process.env.SCRAPE_API_TOKEN;

  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await runRssImport();
    return NextResponse.json(summary);
  } catch (err) {
    console.error("Import failed:", err);
    return NextResponse.json(
      { error: "Import failed" },
      { status: 500 },
    );
  }
}
