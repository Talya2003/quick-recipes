"use client";

import { track } from "@/lib/track";

interface RecipeActionsProps {
  title: string;
  ingredients: string[];
}

export function RecipeActions({ title, ingredients }: RecipeActionsProps) {
  const copyIngredients = async () => {
    const content = `${title}\n\n${ingredients.map((item) => `- ${item}`).join("\n")}`;
    await navigator.clipboard.writeText(content);
    track("copy_ingredients", { recipe: title });
  };

  const shareRecipe = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: window.location.href });
      track("share", { recipe: title, native: true });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    track("share", { recipe: title, native: false });
  };

  const printPage = () => {
    window.print();
    track("print", { recipe: title });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={printPage}
        className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        הדפסה
      </button>
      <button
        type="button"
        onClick={() => {
          void copyIngredients();
        }}
        className="rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        העתקת מצרכים
      </button>
      <button
        type="button"
        onClick={() => {
          void shareRecipe();
        }}
        className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      >
        שיתוף
      </button>
    </div>
  );
}
