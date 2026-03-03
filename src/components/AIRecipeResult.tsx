"use client";

import { useMemo, useState } from "react";
import { parseAIRecipe } from "@/lib/aiRecipe";

interface AIRecipeResultProps {
  recipe: string;
}

export function AIRecipeResult({ recipe }: AIRecipeResultProps) {
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const parsed = useMemo(() => parseAIRecipe(recipe), [recipe]);

  const copyRecipe = async () => {
    await navigator.clipboard.writeText(recipe);
    setCopyState("done");
    window.setTimeout(() => setCopyState("idle"), 2000);
  };

  return (
    <section className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold">{parsed.title}</h2>
        <button
          type="button"
          onClick={() => {
            void copyRecipe();
          }}
          className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {copyState === "done" ? "הועתק" : "העתקת מתכון"}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-brand-100 px-3 py-1 text-brand-900 dark:bg-brand-900/40 dark:text-brand-100">
          זמן הכנה: {parsed.prepTime}
        </span>
        <span className="rounded-full bg-zinc-100 px-3 py-1 dark:bg-zinc-800">רמת קושי: {parsed.difficulty}</span>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold">רשימת מצרכים עם כמויות</h3>
        {parsed.ingredients.length > 0 ? (
          <ul className="list-disc space-y-1 pr-5 text-sm text-zinc-700 dark:text-zinc-200">
            {parsed.ingredients.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">לא זוהתה רשימת מצרכים מובנית.</p>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold">אופן ההכנה</h3>
        {parsed.steps.length > 0 ? (
          <ol className="list-decimal space-y-2 pr-5 text-sm text-zinc-700 dark:text-zinc-200">
            {parsed.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-300">לא זוהו שלבי הכנה מובנים.</p>
        )}
      </div>

      {parsed.tips.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold">טיפים</h3>
          <ul className="list-disc space-y-1 pr-5 text-sm text-zinc-700 dark:text-zinc-200">
            {parsed.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
