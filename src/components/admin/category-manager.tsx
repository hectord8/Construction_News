"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCategory, saveCategory } from "@/server/admin";

const field =
  "w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent";

export function CategoryManager({
  categories,
}: {
  categories: {
    slug: string;
    name: string;
    description: string;
    order: number;
  }[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <form
        action={(fd) =>
          startTransition(async () => {
            await saveCategory(fd);
            router.refresh();
          })
        }
        className="grid gap-3 rounded-xl border border-dashed border-line bg-paper p-4 sm:grid-cols-[1fr_1fr_2fr_70px_auto]"
      >
        <input
          name="slug"
          placeholder="slug"
          required
          className={field}
          pattern="[a-z0-9-]+"
        />
        <input name="name" placeholder="Name" required className={field} />
        <input
          name="description"
          placeholder="Short description"
          className={field}
        />
        <input
          name="order"
          type="number"
          defaultValue={99}
          className={field}
          min={0}
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          Add
        </button>
      </form>

      <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-paper">
        {categories.map((c) => (
          <form
            key={c.slug}
            action={(fd) =>
              startTransition(async () => {
                await saveCategory(fd);
                router.refresh();
              })
            }
            className="grid gap-3 p-4 sm:grid-cols-[1fr_1fr_2fr_70px_auto]"
          >
            <input
              name="slug"
              defaultValue={c.slug}
              className={`${field} font-mono`}
            />
            <input name="name" defaultValue={c.name} className={field} />
            <input
              name="description"
              defaultValue={c.description}
              className={field}
            />
            <input
              name="order"
              type="number"
              defaultValue={c.order}
              className={field}
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={pending}
                className="text-sm font-semibold text-accent-strong hover:underline disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteCategory(c.slug);
                    router.refresh();
                  })
                }
                className="text-sm text-muted hover:text-red-600 disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
