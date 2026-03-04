import type { Metadata } from "next";
import Link from "next/link";
import { PublicRecipeCard } from "@/components/PublicRecipeCard";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "מתכוני קהילה",
  description: "מתכונים שפורסמו על ידי משתמשים, לצפייה לכולם ושמירה לרשימה אישית."
};

export default async function CommunityPage() {
  const supabase = getSupabaseServerClient();

  const { data: recipes, error: recipesError } = await supabase
    .from("public_recipes")
    .select("id, author_id, title, description, minutes_total, ingredients, tags, recipe_text, created_at")
    .order("created_at", { ascending: false });

  const authorIds = Array.from(new Set((recipes ?? []).map((item) => item.author_id)));
  const { data: profiles } =
    authorIds.length > 0
      ? await supabase.from("profiles").select("id, display_name").in("id", authorIds)
      : { data: [] as Array<{ id: string; display_name: string | null }> };

  const authorNameMap = new Map<string, string>((profiles ?? []).map((profile) => [profile.id, profile.display_name || "משתמשת"]));

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">מתכוני קהילה</h1>
        <p className="text-zinc-600 dark:text-zinc-300">
          כאן תמצאי מתכונים שפורסמו על ידי משתמשים אחרים. אפשר לצפות בכל מתכון ולשמור אותו לרשימה האישית שלך.
        </p>
      </header>

      {recipesError && (
        <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          לא הצלחנו לטעון כרגע מתכוני קהילה. אם זו הפעלה ראשונה, בדקי שהטבלה <code>public_recipes</code> קיימת.
        </p>
      )}

      {!recipesError && (!recipes || recipes.length === 0) && (
        <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-700">
          <p className="text-zinc-600 dark:text-zinc-300">עדיין אין מתכוני קהילה. רוצה להעלות ראשון?</p>
          <Link
            href="/submit"
            className="mt-3 inline-flex rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            העלאת מתכון
          </Link>
        </div>
      )}

      {recipes && recipes.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <PublicRecipeCard
              key={recipe.id}
              recipe={recipe}
              authorName={authorNameMap.get(recipe.author_id) ?? "משתמשת"}
            />
          ))}
        </div>
      )}
    </div>
  );
}

