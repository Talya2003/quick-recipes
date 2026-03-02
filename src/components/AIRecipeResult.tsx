"use client";

import { useMemo, useState } from "react";

interface AIRecipeResultProps {
  recipe: string;
}

interface ParsedRecipe {
  title: string;
  prepTime: string;
  difficulty: string;
  ingredients: string[];
  steps: string[];
  tips: string[];
}

function cleanLinePrefix(value: string): string {
  return value.replace(/^[-*•]\s*/, "").replace(/^\d+[\).\s-]*/, "").trim();
}

function parseRecipe(raw: string): ParsedRecipe {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let title = "";
  let prepTime = "";
  let difficulty = "";
  const ingredients: string[] = [];
  const steps: string[] = [];
  const tips: string[] = [];

  let section: "ingredients" | "steps" | "tips" | null = null;

  for (const line of lines) {
    if (line.startsWith("שם המתכון:")) {
      title = line.replace("שם המתכון:", "").trim();
      section = null;
      continue;
    }
    if (line.startsWith("זמן הכנה:")) {
      prepTime = line.replace("זמן הכנה:", "").trim();
      section = null;
      continue;
    }
    if (line.startsWith("רמת קושי:")) {
      difficulty = line.replace("רמת קושי:", "").trim();
      section = null;
      continue;
    }
    if (line.startsWith("רשימת מצרכים עם כמויות:")) {
      section = "ingredients";
      continue;
    }
    if (line.startsWith("אופן ההכנה:")) {
      section = "steps";
      continue;
    }
    if (line.startsWith("טיפים")) {
      section = "tips";
      const inlineTip = line.replace(/^טיפים(?:\s*\(אופציונלי\))?:/, "").trim();
      if (inlineTip) tips.push(cleanLinePrefix(inlineTip));
      continue;
    }

    if (section === "ingredients") {
      const cleaned = cleanLinePrefix(line);
      if (cleaned) ingredients.push(cleaned);
      continue;
    }
    if (section === "steps") {
      const cleaned = cleanLinePrefix(line);
      if (cleaned) steps.push(cleaned);
      continue;
    }
    if (section === "tips") {
      const cleaned = cleanLinePrefix(line);
      if (cleaned) tips.push(cleaned);
    }
  }

  return {
    title: title || "מתכון מוצע",
    prepTime: prepTime || "לא צוין",
    difficulty: difficulty || "לא צוין",
    ingredients,
    steps,
    tips
  };
}

export function AIRecipeResult({ recipe }: AIRecipeResultProps) {
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const parsed = useMemo(() => parseRecipe(recipe), [recipe]);

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
