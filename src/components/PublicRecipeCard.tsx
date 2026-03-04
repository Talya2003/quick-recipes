import Link from "next/link";
import { formatPublishedDate } from "@/lib/utils";
import { PublicRecipeSaveButton } from "@/components/PublicRecipeSaveButton";

interface PublicRecipeCardProps {
  recipe: {
    id: string;
    author_id: string;
    title: string;
    description: string;
    minutes_total: number;
    ingredients: string[];
    tags: string[];
    created_at: string;
    recipe_text: string;
  };
  authorName: string;
}

export function PublicRecipeCard({ recipe, authorName }: PublicRecipeCardProps) {
  return (
    <article className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-brand-100 px-2.5 py-1 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
          מוכן תוך {recipe.minutes_total} דק׳
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {recipe.ingredients.length} מצרכים
        </span>
        <span className="rounded-full bg-accent-100 px-2.5 py-1 text-accent-800 dark:bg-accent-900/40 dark:text-accent-200">
          קהילה
        </span>
      </div>

      <div>
        <h2 className="text-lg font-bold leading-tight text-zinc-900 dark:text-zinc-100">
          <Link href={`/community/${recipe.id}`} className="hover:text-brand-700 dark:hover:text-brand-300">
            {recipe.title}
          </Link>
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">{recipe.description}</p>
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        מאת {authorName} · {formatPublishedDate(recipe.created_at)}
      </p>

      {recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {recipe.tags.slice(0, 4).map((tag) => (
            <span
              key={`${recipe.id}-${tag}`}
              className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 pt-1">
        <Link
          href={`/community/${recipe.id}`}
          className="inline-flex rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-medium dark:border-zinc-700"
        >
          לצפייה
        </Link>
        <PublicRecipeSaveButton
          recipeId={recipe.id}
          authorId={recipe.author_id}
          title={recipe.title}
          recipeText={recipe.recipe_text}
        />
      </div>
    </article>
  );
}

