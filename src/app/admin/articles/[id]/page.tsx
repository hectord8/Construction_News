import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleById, getCategories, getAllTags } from "@/lib/queries";
import { ArticleEditor } from "@/components/admin/article-editor";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;
  const [article, categories, allTags] = await Promise.all([
    getArticleById(id),
    getCategories(),
    getAllTags(),
  ]);
  if (!article) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-ink">Edit article</h2>
        {article.status === "published" && (
          <Link
            href={`/articles/${article.slug}`}
            target="_blank"
            className="text-sm font-semibold text-accent-strong hover:underline"
          >
            View live →
          </Link>
        )}
      </div>
      <div className="mt-6">
        <ArticleEditor
          article={{
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt,
            body: article.body,
            coverImage: article.coverImage,
            categorySlug: article.categorySlug,
            region: article.region,
            status: article.status,
            featured: article.featured,
            leadStory: article.leadStory,
            authorName: article.authorName,
            tags: article.tags,
          }}
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          allTags={allTags.map((t) => ({ slug: t.slug, name: t.name }))}
        />
      </div>
    </div>
  );
}
