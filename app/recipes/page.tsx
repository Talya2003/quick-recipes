import type { Metadata } from "next";
import { RecipesIndexClient } from "@/components/RecipesIndexClient";
import { SearchBar } from "@/components/SearchBar";
import { getNewestRecipes } from "@/data/recipes";

export const metadata: Metadata = {
  title: "כל המתכונים",
  description: "עמוד מתכונים עם סינון לפי זמן, כמות מצרכים, קטגוריה ורמת קושי."
};

export default function RecipesPage() {
  const allRecipes = getNewestRecipes();

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-bold">כל המתכונים</h1>
        <p className="text-zinc-600 dark:text-zinc-300">סנני לפי זמן, מצרכים, קטגוריה וקושי ותמצאי מהר מה להכין.</p>
      </header>

      <SearchBar placeholder="חפשי מתכון גם כאן..." />
      <RecipesIndexClient recipes={allRecipes} />
    </div>
  );
}
