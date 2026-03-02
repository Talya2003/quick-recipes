import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NewsletterCard } from "@/components/NewsletterCard";
import { RecipeActions } from "@/components/RecipeActions";
import { RecipeCard } from "@/components/RecipeCard";
import { TagChips } from "@/components/TagChips";
import { categoryLabelMap, getRecipeBySlug, getRelatedRecipes, recipes } from "@/data/recipes";

interface RecipeDetailPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({ params }: RecipeDetailPageProps): Promise<Metadata> {
  const recipe = getRecipeBySlug(params.slug);

  if (!recipe) {
    return {
      title: "מתכון לא נמצא"
    };
  }

  return {
    title: recipe.title,
    description: recipe.description,
    alternates: {
      canonical: `/recipes/${recipe.slug}`
    },
    openGraph: {
      title: recipe.title,
      description: recipe.description,
      type: "article",
      url: `/recipes/${recipe.slug}`,
      images: [
        {
          url: recipe.image,
          width: 1200,
          height: 630,
          alt: recipe.title
        }
      ]
    }
  };
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const recipe = getRecipeBySlug(params.slug);

  if (!recipe) {
    notFound();
  }

  const related = getRelatedRecipes(recipe, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: recipe.title,
    description: recipe.description,
    image: [recipe.image],
    totalTime: `PT${recipe.minutesTotal}M`,
    prepTime: `PT${recipe.minutesPrep}M`,
    recipeCategory: categoryLabelMap[recipe.category],
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      text
    }))
  };

  return (
    <div className="space-y-10">
      <Breadcrumbs items={[{ href: "/recipes", label: "מתכונים" }, { href: `/recipes/${recipe.slug}`, label: recipe.title }]} />

      <article className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">{categoryLabelMap[recipe.category]}</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight">{recipe.title}</h1>
            <p className="mt-3 text-zinc-600 dark:text-zinc-300">{recipe.description}</p>

            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="rounded-full bg-brand-100 px-3 py-1 text-brand-900 dark:bg-brand-900/40 dark:text-brand-100">
                מוכן תוך {recipe.minutesTotal} דק׳
              </span>
              <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">{recipe.ingredients.length} מצרכים</span>
              <span className="rounded-full bg-accent-100 px-3 py-1 text-accent-900 dark:bg-accent-900/40 dark:text-accent-100">{recipe.difficulty}</span>
            </div>

            <div className="mt-4">
              <TagChips tags={recipe.tags} />
            </div>

            <div className="mt-5">
              <RecipeActions title={recipe.title} ingredients={recipe.ingredients} />
            </div>
          </header>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold">מה צריך</h2>
            <ul className="mt-4 space-y-3">
              {recipe.ingredients.map((ingredient, index) => {
                const ingredientId = `ingredient-${index}`;
                return (
                  <li key={ingredientId} className="flex items-center gap-3 rounded-xl bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                    <input
                      id={ingredientId}
                      type="checkbox"
                      className="h-4 w-4 rounded border-zinc-400 text-brand-600 focus:ring-brand-500"
                    />
                    <label htmlFor={ingredientId} className="text-sm">
                      {ingredient}
                    </label>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-bold">כמה דקות עבודה</h2>
              <p className="mt-2 text-2xl font-bold text-brand-700 dark:text-brand-300">{recipe.minutesPrep} דק׳</p>
            </div>
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-lg font-bold">זמן כולל</h2>
              <p className="mt-2 text-2xl font-bold text-brand-700 dark:text-brand-300">{recipe.minutesTotal} דק׳</p>
            </div>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold">איך מכינים</h2>
            <ol className="mt-4 space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={step} className="flex gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-900 dark:bg-brand-900/40 dark:text-brand-100">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-2xl font-bold">טיפים</h2>
            <ul className="mt-4 list-disc space-y-2 pr-5 text-sm text-zinc-700 dark:text-zinc-200">
              <li>אפשר להחליף מרכיב אחד דומה לפי מה שיש בבית.</li>
              <li>אם רוצים לקצר עוד, מכינים מראש חיתוך ירקות לשבוע.</li>
              <li>לקבלת וריאציה, מוסיפים תבלין אחד חדש בכל פעם.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold">מתכונים דומים</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {related.map((item) => (
                <RecipeCard key={item.slug} recipe={item} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <NewsletterCard compact source="recipe_sticky" />
        </aside>
      </article>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}
