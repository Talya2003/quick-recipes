import Image from "next/image";
import Link from "next/link";
import { type Recipe, categoryLabelMap } from "@/data/recipes";
import { formatMinutes } from "@/lib/utils";
import { TagChips } from "@/components/TagChips";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-card transition hover:-translate-y-0.5 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
      <Link href={`/recipes/${recipe.slug}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400">
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        </div>
        <div className="space-y-4 p-4">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
              {formatMinutes(recipe.minutesTotal)}
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {recipe.ingredients.length} מצרכים
            </span>
            <span className="rounded-full bg-accent-100 px-2.5 py-1 text-accent-800 dark:bg-accent-900/40 dark:text-accent-200">
              {categoryLabelMap[recipe.category]}
            </span>
          </div>
          <h3 className="text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-100">{recipe.title}</h3>
          <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-300">{recipe.description}</p>
          <TagChips tags={recipe.tags.slice(0, 3)} />
          <span className="inline-flex rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700">
            לצפייה
          </span>
        </div>
      </Link>
    </article>
  );
}
