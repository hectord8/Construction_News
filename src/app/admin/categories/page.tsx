import { getCategories } from "@/lib/queries";
import { CategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div>
      <h2 className="font-display text-lg font-bold text-ink">Categories</h2>
      <p className="mt-1 text-sm text-muted">
        Categories define the site&apos;s sections. Deleting a category that
        still has articles is blocked.
      </p>
      <div className="mt-6">
        <CategoryManager
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.name,
            description: c.description ?? "",
            order: c.order ?? 0,
          }))}
        />
      </div>
    </div>
  );
}
