import Link from "next/link";
import { cn, formatDate, readingTime } from "@/lib/utils";

export type ArticleCardData = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  categorySlug: string;
  categoryName?: string;
  region: string | null;
  authorName: string;
  publishedAt: Date | string | null;
  tags?: string[];
  body?: string;
  viewCount?: number;
};

const palette: Record<string, string> = {
  commercial: "bg-sky-600",
  residential: "bg-emerald-600",
  infrastructure: "bg-slate-700",
  "safety-regulation": "bg-amber-500",
  "materials-equipment": "bg-orange-600",
  technology: "bg-violet-600",
};

export function CategoryBadge({
  name,
  slug,
}: {
  name: string;
  slug: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent-strong">
      <span className={cn("h-1.5 w-1.5 rounded-full", palette[slug] ?? "bg-accent")} />
      {name}
    </span>
  );
}

export function ArticleCard({
  article,
  horizontal = false,
}: {
  article: ArticleCardData;
  horizontal?: boolean;
}) {
  return (
    <article
      className={cn(
        "group flex",
        horizontal ? "gap-4" : "flex-col gap-3",
      )}
    >
      {article.coverImage && (
        <Link
          href={`/articles/${article.slug}`}
          className={cn(
            "block overflow-hidden rounded-lg bg-line",
            horizontal ? "h-24 w-32 shrink-0 sm:h-20 sm:w-28" : "aspect-[16/9] w-full",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>
      )}
      <div className={cn("flex min-w-0 flex-col", horizontal && "gap-1")}>
        <CategoryBadge
          name={article.categoryName ?? article.categorySlug}
          slug={article.categorySlug}
        />
        <h3
          className={cn(
            "font-display font-bold leading-snug text-ink transition-colors group-hover:text-accent-strong",
            horizontal ? "mt-0.5 line-clamp-3 text-sm" : "mt-2 line-clamp-3 text-lg",
          )}
        >
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>
        {!horizontal && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
            {article.excerpt}
          </p>
        )}
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <span className="font-medium text-ink">{article.authorName}</span>
          <span aria-hidden>·</span>
          <time dateTime={String(article.publishedAt)}>
            {formatDate(article.publishedAt)}
          </time>
          {article.body && (
            <>
              <span aria-hidden>·</span>
              <span>{readingTime(article.body)} min read</span>
            </>
          )}
          {article.region && (
            <>
              <span aria-hidden>·</span>
              <span>{article.region}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
