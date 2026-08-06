import { getCategories, getAllTags } from "@/lib/queries";
import { ArticleEditor } from "@/components/admin/article-editor";

export default async function NewArticlePage() {
  const [categories, allTags] = await Promise.all([
    getCategories(),
    getAllTags(),
  ]);

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">New article</h2>
      <div className="mt-6">
        <ArticleEditor
          categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
          allTags={allTags.map((t) => ({ slug: t.slug, name: t.name }))}
        />
      </div>
    </div>
  );
}
