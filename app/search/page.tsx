import type { Metadata } from "next";
import { SearchClient } from "@/components/SearchClient";
import { recipes } from "@/data/recipes";

interface SearchPageProps {
  searchParams: { q?: string };
}

export const metadata: Metadata = {
  title: "חיפוש",
  description: "חיפוש מתכונים מהירים לפי שם, תגיות ומרכיבים."
};

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q ?? "";

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">חיפוש מתכונים</h1>
        <p className="text-zinc-600 dark:text-zinc-300">תוצאות מיידיות מתוך מאגר המתכונים המקומי.</p>
      </header>

      <SearchClient recipes={recipes} initialQuery={query} />
    </div>
  );
}
