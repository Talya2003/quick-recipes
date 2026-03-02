import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { RecipeCard } from "@/components/RecipeCard";
import { categories, getRecipesByCategory } from "@/data/recipes";
import { slugToCategory } from "@/lib/utils";

interface CategoryDetailPageProps {
  params: { category: string };
}

export function generateStaticParams() {
  return categories.map((category) => ({ category: category.slug }));
}

export function generateMetadata({ params }: CategoryDetailPageProps): Metadata {
  const category = categories.find((item) => item.slug === params.category);

  if (!category) {
    return { title: "קטגוריה לא נמצאה" };
  }

  return {
    title: category.label,
    description: category.description,
    alternates: {
      canonical: `/categories/${category.slug}`
    }
  };
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const categorySlug = slugToCategory(params.category);
  if (!categorySlug) {
    notFound();
  }

  const category = categories.find((item) => item.slug === categorySlug);
  const categoryRecipes = getRecipesByCategory(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[{ href: "/categories", label: "קטגוריות" }, { href: `/categories/${category.slug}`, label: category.label }]} />
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">{category.label}</h1>
        <p className="text-zinc-600 dark:text-zinc-300">{category.description}</p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {categoryRecipes.map((recipe) => (
          <RecipeCard key={recipe.slug} recipe={recipe} />
        ))}
      </div>
    </div>
  );
}
