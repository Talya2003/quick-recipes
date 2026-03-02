import type { Metadata } from "next";
import Link from "next/link";
import { categories, recipes } from "@/data/recipes";

export const metadata: Metadata = {
  title: "קטגוריות",
  description: "גלי מתכונים מהירים לפי קטגוריות."
};

export default function CategoriesPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">קטגוריות</h1>
        <p className="text-zinc-600 dark:text-zinc-300">בחירה לפי סוג הארוחה - ולכל קטגוריה מתכונים קצרים וברורים.</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const count = recipes.filter((recipe) => recipe.category === category.slug).length;
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="text-xl font-bold">{category.label}</h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{category.description}</p>
              <p className="mt-4 text-sm font-semibold text-brand-700 dark:text-brand-300">{count} מתכונים</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
