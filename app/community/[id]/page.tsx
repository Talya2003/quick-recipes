import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PublicRecipeSaveButton } from "@/components/PublicRecipeSaveButton";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { formatPublishedDate } from "@/lib/utils";

interface CommunityRecipePageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: CommunityRecipePageProps): Promise<Metadata> {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase.from("public_recipes").select("title, description").eq("id", params.id).maybeSingle();

  if (!data) {
    return {
      title: "מתכון קהילה לא נמצא"
    };
  }

  return {
    title: `${data.title} | מתכוני קהילה`,
    description: data.description,
    alternates: {
      canonical: `/community/${params.id}`
    }
  };
}

export default async function CommunityRecipePage({ params }: CommunityRecipePageProps) {
  const supabase = getSupabaseServerClient();

  const { data: recipe } = await supabase
    .from("public_recipes")
    .select("id, author_id, title, description, minutes_total, difficulty, ingredients, steps, tags, recipe_text, created_at")
    .eq("id", params.id)
    .maybeSingle();

  if (!recipe) {
    notFound();
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", recipe.author_id).maybeSingle();
  const authorName = profile?.display_name || "משתמשת";

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { href: "/community", label: "מתכוני קהילה" },
          { href: `/community/${recipe.id}`, label: recipe.title }
        ]}
      />

      <article className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
        <header className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
              מוכן תוך {recipe.minutes_total} דק׳
            </span>
            <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              {recipe.ingredients.length} מצרכים
            </span>
            <span className="rounded-full bg-accent-100 px-2.5 py-1 text-accent-800 dark:bg-accent-900/40 dark:text-accent-200">
              {recipe.difficulty}
            </span>
          </div>
          <h1 className="text-3xl font-bold leading-tight">{recipe.title}</h1>
          <p className="text-zinc-600 dark:text-zinc-300">{recipe.description}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            מאת {authorName} · {formatPublishedDate(recipe.created_at)}
          </p>
          <div className="pt-1">
            <PublicRecipeSaveButton
              recipeId={recipe.id}
              authorId={recipe.author_id}
              title={recipe.title}
              recipeText={recipe.recipe_text}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:hover:bg-zinc-800"
            />
          </div>
        </header>

        {recipe.tags.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xl font-bold">תגיות</h2>
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.map((tag) => (
                <span
                  key={`${recipe.id}-${tag}`}
                  className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">מה צריך</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={`${recipe.id}-ingredient-${index}`} className="rounded-xl bg-zinc-100 px-3 py-2 text-sm dark:bg-zinc-800">
                {ingredient}
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-bold">איך מכינים</h2>
          <ol className="space-y-3">
            {recipe.steps.map((step, index) => (
              <li key={`${recipe.id}-step-${index}`} className="flex gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-900 dark:bg-brand-900/40 dark:text-brand-100">
                  {index + 1}
                </span>
                <p className="text-sm leading-6">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </article>
    </div>
  );
}

