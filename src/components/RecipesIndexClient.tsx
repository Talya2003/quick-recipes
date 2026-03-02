"use client";

import { useMemo, useState } from "react";
import { type Recipe } from "@/data/recipes";
import { FilterBar, type FiltersState } from "@/components/FilterBar";
import { Pagination } from "@/components/Pagination";
import { RecipeCard } from "@/components/RecipeCard";
import { track } from "@/lib/track";

const PAGE_SIZE = 9;

type SortBy = "newest" | "fastest" | "fewest" | "popular";

interface RecipesIndexClientProps {
  recipes: Recipe[];
}

const defaultFilters: FiltersState = {
  maxMinutes: "all",
  maxIngredients: "all",
  category: "all",
  difficulty: "all"
};

export function RecipesIndexClient({ recipes }: RecipesIndexClientProps) {
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const withFilters = recipes.filter((recipe) => {
      if (filters.maxMinutes !== "all" && recipe.minutesTotal > Number(filters.maxMinutes)) return false;
      if (filters.maxIngredients !== "all" && recipe.ingredients.length > Number(filters.maxIngredients)) return false;
      if (filters.category !== "all" && recipe.category !== filters.category) return false;
      if (filters.difficulty !== "all" && recipe.difficulty !== filters.difficulty) return false;
      return true;
    });

    const sorted = [...withFilters].sort((a, b) => {
      if (sortBy === "fastest") return a.minutesTotal - b.minutesTotal;
      if (sortBy === "fewest") return a.ingredients.length - b.ingredients.length;
      if (sortBy === "popular") return b.popularityScore - a.popularityScore;
      return +new Date(b.publishedAt) - +new Date(a.publishedAt);
    });

    return sorted;
  }, [filters, recipes, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <FilterBar
        value={filters}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{filtered.length} תוצאות</p>
        <label className="flex items-center gap-2 text-sm">
          מיון
          <select
            value={sortBy}
            onChange={(e) => {
              const nextSort = e.target.value as SortBy;
              setSortBy(nextSort);
              track("filter_change", { sortBy: nextSort });
              setPage(1);
            }}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="newest">החדשים ביותר</option>
            <option value="fastest">הכי מהירים</option>
            <option value="fewest">הכי מעט מצרכים</option>
            <option value="popular">הכי פופולריים</option>
          </select>
        </label>
      </section>

      {paged.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {paged.map((recipe) => (
            <RecipeCard key={recipe.slug} recipe={recipe} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
          לא נמצאו מתכונים לפי הסינון שבחרת.
        </p>
      )}

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
