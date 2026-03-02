"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { type Recipe } from "@/data/recipes";
import { RecipeCard } from "@/components/RecipeCard";
import { track } from "@/lib/track";

interface SearchClientProps {
  recipes: Recipe[];
  initialQuery: string;
}

export function SearchClient({ recipes, initialQuery }: SearchClientProps) {
  const [query, setQuery] = useState(initialQuery);
  const router = useRouter();
  const searchParams = useSearchParams();

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return recipes.filter((recipe) => {
      const haystack = [
        recipe.title,
        recipe.description,
        recipe.tags.join(" "),
        recipe.ingredients.join(" ")
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalized);
    });
  }, [query, recipes]);

  const updateUrl = (nextQuery: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextQuery) params.set("q", nextQuery);
    else params.delete("q");
    const nextUrl = params.toString() ? `/search?${params.toString()}` : "/search";
    router.replace(nextUrl);
  };

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">מה בא לך להכין?</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            updateUrl(next);
            track("search", { query: next, source: "search_page_live" });
          }}
          placeholder="לדוגמה: טוסט, שייק, 3 מצרכים"
          className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none ring-brand-300 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>

      {!query.trim() && (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          התחילי להקליד כדי לראות תוצאות מיידיות.
        </p>
      )}

      {query.trim() && results.length > 0 && (
        <>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">נמצאו {results.length} תוצאות</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((recipe) => (
              <RecipeCard key={recipe.slug} recipe={recipe} />
            ))}
          </div>
        </>
      )}

      {query.trim() && results.length === 0 && (
        <section className="rounded-2xl border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
          <h2 className="text-lg font-semibold">לא מצאנו מתכון מתאים</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">נסי ביטויים קצרים כמו "שייק", "טוסט" או "3 מצרכים".</p>
          <ul className="mt-3 list-disc space-y-1 pr-5 text-sm text-zinc-600 dark:text-zinc-300">
            <li>בדקי אם יש שגיאת כתיב.</li>
            <li>נסי שם מרכיב מרכזי.</li>
            <li>חפשי לפי קטגוריה בעמוד הקטגוריות.</li>
          </ul>
        </section>
      )}
    </div>
  );
}
