"use client";

import { useState } from "react";
import { ArticleEditor } from "./article-editor";

export function NewArticle() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [prefill, setPrefill] = useState<any>(null);

  const handleFetch = async () => {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        setPrefill(data.story);
      } else {
        alert("Failed to fetch story");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 rounded-lg border border-line bg-surface p-4">
        <label className="block text-sm font-medium text-ink">
          Import from URL
        </label>
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/article"
            className="flex-1 rounded-md border border-line bg-background px-3 py-2 text-sm text-ink"
          />
          <button
            onClick={handleFetch}
            disabled={loading || !url.trim()}
            className="rounded-md bg-accent-strong px-4 py-2 text-sm font-medium text-background hover:bg-accent-strong/90 disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Fetch"}
          </button>
        </div>
      </div>

      {prefill && (
        <ArticleEditor
          categories={[]}
          allTags={[]}
          article={{
            title: prefill.title,
            slug: prefill.slug || "",
            excerpt: prefill.excerpt,
            body: prefill.body,
            coverImage: prefill.coverImage,
            categorySlug: prefill.categorySlug || "",
            region: prefill.region || "National",
            status: "draft",
            featured: false,
            leadStory: false,
            authorName: prefill.authorName || "",
            tags: prefill.tags || [],
          }}
        />
      )}
    </div>
  );
}
