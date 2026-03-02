"use client";

import { track } from "@/lib/track";

export interface FiltersState {
  maxMinutes: "all" | "5" | "10" | "15";
  maxIngredients: "all" | "3" | "5" | "8";
  category: "all" | "breakfast" | "lunch" | "dinner" | "snacks" | "desserts" | "drinks";
  difficulty: "all" | "קל" | "בינוני";
}

interface FilterBarProps {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
}

const empty: FiltersState = {
  maxMinutes: "all",
  maxIngredients: "all",
  category: "all",
  difficulty: "all"
};

export function FilterBar({ value, onChange }: FilterBarProps) {
  const update = <K extends keyof FiltersState>(key: K, next: FiltersState[K]) => {
    const payload = { ...value, [key]: next };
    onChange(payload);
    track("filter_change", { [key]: next });
  };

  return (
    <section aria-label="סינון מתכונים" className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <div className="grid gap-3 md:grid-cols-4">
        <label className="grid gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          זמן
          <select
            value={value.maxMinutes}
            onChange={(e) => update("maxMinutes", e.target.value as FiltersState["maxMinutes"])}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">הכל</option>
            <option value="5">עד 5 דקות</option>
            <option value="10">עד 10 דקות</option>
            <option value="15">עד 15 דקות</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          מצרכים
          <select
            value={value.maxIngredients}
            onChange={(e) => update("maxIngredients", e.target.value as FiltersState["maxIngredients"])}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">הכל</option>
            <option value="3">עד 3 מצרכים</option>
            <option value="5">עד 5 מצרכים</option>
            <option value="8">עד 8 מצרכים</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          קטגוריה
          <select
            value={value.category}
            onChange={(e) => update("category", e.target.value as FiltersState["category"])}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">הכל</option>
            <option value="breakfast">ארוחת בוקר</option>
            <option value="lunch">צהריים</option>
            <option value="dinner">ערב</option>
            <option value="snacks">נשנושים</option>
            <option value="desserts">קינוחים</option>
            <option value="drinks">משקאות</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          רמת קושי
          <select
            value={value.difficulty}
            onChange={(e) => update("difficulty", e.target.value as FiltersState["difficulty"])}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">הכל</option>
            <option value="קל">קל</option>
            <option value="בינוני">בינוני</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={() => {
          onChange(empty);
          track("filter_change", { reset: true });
        }}
        className="mt-3 rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        ניקוי סינון
      </button>
    </section>
  );
}
