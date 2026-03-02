import Link from "next/link";
import { NewsletterCard } from "@/components/NewsletterCard";
import { RecipeCard } from "@/components/RecipeCard";
import { SearchBar } from "@/components/SearchBar";
import { recipes, getPopularRecipes } from "@/data/recipes";

export default function HomePage() {
  const fastest = recipes.filter((recipe) => recipe.minutesTotal <= 7).slice(0, 4);
  const threeIngredients = recipes.filter((recipe) => recipe.ingredients.length <= 3).slice(0, 4);
  const popular = getPopularRecipes(4);
  const sweet = recipes.filter((recipe) => recipe.category === "desserts").slice(0, 4);
  const savory = recipes.filter((recipe) => recipe.category !== "desserts" && recipe.category !== "drinks").slice(0, 4);

  return (
    <div className="space-y-16">
      <section className="rounded-3xl border border-brand-200 bg-gradient-to-bl from-brand-100 via-white to-accent-100 p-8 shadow-card dark:border-brand-800 dark:from-brand-950/50 dark:via-zinc-950 dark:to-accent-950/40">
        <div className="max-w-3xl space-y-5">
          <h1 className="text-3xl font-bold leading-tight text-zinc-900 sm:text-5xl dark:text-zinc-100">מתכונים זריזים. מינימום מצרכים. מקסימום ביסים.</h1>
          <p className="text-base text-zinc-700 sm:text-lg dark:text-zinc-200">כל המתכונים כאן נועדו לימים עמוסים: מעט מרכיבים, הוראות קצרות, תוצאה מהירה.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/recipes" className="rounded-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700">
              מתכונים ב-5 דקות
            </Link>
            <Link
              href="/recipes"
              className="rounded-2xl border border-zinc-300 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              רק 3 מצרכים
            </Link>
          </div>
          <SearchBar placeholder="חפשי לפי שם מתכון או מרכיב..." />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">הכי מהירים</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {fastest.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">3 מצרכים</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {threeIngredients.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold">פופולריים השבוע</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">מתוקים זריזים</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {sweet.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">מלוחים זריזים</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {savory.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        </div>
      </section>

      <NewsletterCard source="home" />

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-2xl font-bold">איך זה עובד</h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-3">
          <li className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
            <p className="text-sm font-semibold">1. בוחרים זמן</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">מסננים לפי 5, 10 או 15 דקות.</p>
          </li>
          <li className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
            <p className="text-sm font-semibold">2. סורקים מצרכים</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">רואים מיד כמה מצרכים צריך.</p>
          </li>
          <li className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800">
            <p className="text-sm font-semibold">3. מתחילים לבשל</p>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">שלבים קצרים וברורים עד הצלחת.</p>
          </li>
        </ol>
      </section>
    </div>
  );
}
