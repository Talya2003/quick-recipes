"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/track";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
}

export function SearchBar({ defaultValue = "", placeholder = "חפשי מתכון מהיר..." }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const router = useRouter();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    track("search", { query: trimmed, source: "search_bar_submit" });
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  };

  return (
    <form onSubmit={onSubmit} className="w-full" role="search" aria-label="חיפוש מתכונים">
      <div className="flex rounded-2xl border border-zinc-300 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <label htmlFor="main-search" className="sr-only">
          חיפוש
        </label>
        <input
          id="main-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-r-2xl bg-transparent px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          className="rounded-l-2xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          חיפוש
        </button>
      </div>
    </form>
  );
}
