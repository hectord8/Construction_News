"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveArticle } from "@/server/admin";
import { slugify } from "@/lib/utils";
import { REGIONS } from "@/lib/regions";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";

type EditorProps = {
  article?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    coverImage: string | null;
    categorySlug: string;
    region: string | null;
    status: "draft" | "published";
    featured: boolean;
    leadStory: boolean;
    authorName: string;
    tags: string[];
  };
  categories: { slug: string; name: string }[];
  allTags: { slug: string; name: string }[];
};

const field =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent";
const labelCls = "mb-1 block text-xs font-medium text-muted";

export function ArticleEditor({ article, categories, allTags }: EditorProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [body, setBody] = useState(article?.body ?? "");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [region, setRegion] = useState(article?.region ?? "");
  const [categorySlug, setCategorySlug] = useState(
    article?.categorySlug ?? categories[0]?.slug ?? "",
  );
  const [status, setStatus] = useState<"draft" | "published">(
    article?.status ?? "draft",
  );
  const [featured, setFeatured] = useState(article?.featured ?? false);
  const [leadStory, setLeadStory] = useState(article?.leadStory ?? false);
  const [authorName, setAuthorName] = useState(article?.authorName ?? "");
  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(false);
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(
    null,
  );

  function submit(formData: FormData) {
    setState(null);
    startTransition(async () => {
      const res = await saveArticle(article?.id ?? null, formData);
      setState({ ok: res.ok, message: res.message });
      if (res.ok) {
        if (res.id) {
          router.push(`/admin/articles/${res.id}`);
        } else {
          router.push("/admin/articles");
        }
        router.refresh();
      }
    });
  }

  function addTag() {
    const s = slugify(tagInput);
    if (s && !tags.includes(s)) setTags((t) => [...t, s]);
    setTagInput("");
  }

  return (
    <form action={submit} className="space-y-6">
      {state && (
        <p
          className={cn(
            "rounded-md px-4 py-3 text-sm font-medium",
            state.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
          )}
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Title</label>
            <input
              name="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!article || !article.slug) setSlug(slugify(e.target.value));
              }}
              required
              className={`${field} text-lg font-semibold`}
            />
          </div>

          <div>
            <label className={labelCls}>Slug</label>
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`${field} font-mono`}
            />
          </div>

          <div>
            <label className={labelCls}>Excerpt</label>
            <textarea
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
              rows={3}
              maxLength={500}
              className={field}
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-medium text-muted">
                Body (Markdown)
              </label>
              <button
                type="button"
                onClick={() => setPreview((p) => !p)}
                className="rounded-md border border-line px-2 py-1 text-xs font-medium text-muted transition-colors hover:text-ink"
              >
                {preview ? "Write" : "Preview"}
              </button>
            </div>
            {preview ? (
              <div className="max-h-[40rem] overflow-y-auto rounded-md border border-line bg-paper p-4">
                {body.trim() ? (
                  <Markdown>{body}</Markdown>
                ) : (
                  <p className="text-sm text-muted">Nothing to preview yet.</p>
                )}
              </div>
            ) : (
              <textarea
                name="body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={22}
                className={`${field} font-mono text-sm leading-relaxed`}
              />
            )}
          </div>

          <div>
            <label className={labelCls}>Cover image URL</label>
            <input
              name="coverImage"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className={`${field} font-mono`}
              placeholder="https://…"
            />
            {coverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={coverImage}
                alt="Cover preview"
                className="mt-2 aspect-[16/9] w-full max-w-sm rounded-md object-cover"
              />
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className={labelCls}>Category</label>
            <select
              name="categorySlug"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className={field}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Region</label>
            <input
              name="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={field}
              placeholder="National"
              list="region-suggestions"
            />
            <datalist id="region-suggestions">
              {REGIONS.map((r) => (
                <option key={r} value={r} />
              ))}
            </datalist>
          </div>

          <div>
            <label className={labelCls}>Author</label>
            <input
              name="authorName"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              required
              className={field}
            />
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <div className="flex gap-2">
              {(["draft", "published"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium capitalize transition-colors",
                    status === s
                      ? "border-accent bg-accent/5 text-accent-strong"
                      : "border-line text-muted hover:text-ink",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <input type="hidden" name="status" value={status} />
          </div>

          <div className="space-y-2 rounded-md border border-line p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-ink">
              <input
                type="checkbox"
                name="leadStory"
                checked={leadStory}
                onChange={(e) => setLeadStory(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Lead story (homepage hero)
            </label>
          </div>

          <div>
            <label className={labelCls}>Tags</label>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className={field}
                placeholder="Add tag…"
              />
              <button
                type="button"
                onClick={addTag}
                className="shrink-0 rounded-md border border-line px-3 text-sm font-medium text-ink hover:text-accent-strong"
              >
                +
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {allTags
                .filter((t) => !tags.includes(t.slug))
                .slice(0, 12)
                .map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setTags((prev) => [...prev, t.slug])}
                    className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted transition-colors hover:border-accent/40 hover:text-accent-strong"
                  >
                    + {t.name}
                  </button>
                ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.map((slug) => (
                <span
                  key={slug}
                  className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent-strong"
                >
                  {slug}
                  <button
                    type="button"
                    onClick={() => setTags((prev) => prev.filter((t) => t !== slug))}
                    aria-label={`Remove ${slug}`}
                    className="hover:text-ink"
                  >
                    ×
                  </button>
                  <input type="hidden" name="tagSlugs" value={slug} />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-line pt-5">
        <button
          type="button"
          onClick={() => router.push("/admin/articles")}
          className="rounded-md border border-line px-4 py-2 text-sm font-medium text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {pending
            ? "Saving…"
            : status === "published"
              ? "Publish article"
              : "Save draft"}
        </button>
      </div>
    </form>
  );
}
