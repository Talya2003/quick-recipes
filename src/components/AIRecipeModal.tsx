"use client";

import { useEffect, useMemo, useState } from "react";
import { AIRecipeResult } from "@/components/AIRecipeResult";
import { track } from "@/lib/track";

const mealTypeOptions = ["", "בוקר", "צהריים", "ערב", "קינוח"] as const;

interface AIRecipeModalProps {
  open: boolean;
  onClose: () => void;
}

interface ApiResponse {
  success: boolean;
  recipe?: string;
  error?: string;
  details?: string;
}

function parseIngredients(input: string): string[] {
  return input
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function AIRecipeModal({ open, onClose }: AIRecipeModalProps) {
  const [ingredientsText, setIngredientsText] = useState("");
  const [mealType, setMealType] = useState<string>("");
  const [maxMinutes, setMaxMinutes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string | null>(null);

  const ingredients = useMemo(() => parseIngredients(ingredientsText), [ingredientsText]);

  useEffect(() => {
    if (!open) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose, open]);

  const validateInput = (): boolean => {
    if (ingredientsText.trim().length > 350) {
      setError("הטקסט ארוך מדי. נסי לקצר את רשימת המצרכים.");
      return false;
    }
    if (ingredients.length < 2) {
      setError("צריך להזין לפחות שני מצרכים.");
      return false;
    }
    if (ingredients.length > 15) {
      setError("אפשר להזין עד 15 מצרכים.");
      return false;
    }
    return true;
  };

  const generateRecipe = async () => {
    setError(null);
    setRecipe(null);

    if (!validateInput()) return;

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        ingredients
      };

      if (mealType) payload.mealType = mealType;
      if (maxMinutes.trim()) payload.maxMinutes = Number(maxMinutes);

      const response = await fetch("/api/ai-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.success || !data.recipe) {
        const combinedError = data.details ? `${data.error ?? "שגיאה"} (${data.details})` : data.error;
        setError(combinedError ?? "לא הצלחנו לייצר מתכון כרגע.");
        return;
      }

      setRecipe(data.recipe);
      track("ai_generate", { ingredients_count: ingredients.length });
    } catch {
      setError("אירעה שגיאת תקשורת. נסי שוב.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 sm:items-center sm:p-6">
      <div className="modal-in w-full max-w-2xl rounded-2xl border border-zinc-200 bg-zinc-50 p-4 shadow-xl transition-all duration-200 dark:border-zinc-800 dark:bg-zinc-950 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 className="text-2xl font-bold">אילו מצרכים יש לך?</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            סגירה
          </button>
        </div>

        <div className="space-y-3">
          <label className="grid gap-1 text-sm font-medium">
            מצרכים (הפרדה בפסיקים)
            <textarea
              value={ingredientsText}
              onChange={(event) => setIngredientsText(event.target.value)}
              rows={4}
              placeholder="לדוגמה: ביצים, עגבנייה, טורטייה"
              className="rounded-2xl border border-zinc-300 bg-white px-3 py-2 text-sm outline-none ring-brand-300 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-medium">
              סוג ארוחה (אופציונלי)
              <select
                value={mealType}
                onChange={(event) => setMealType(event.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                {mealTypeOptions.map((option) => (
                  <option key={option || "default"} value={option}>
                    {option || "ללא העדפה"}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium">
              זמן הכנה מקסימלי (אופציונלי)
              <input
                type="number"
                min={5}
                max={180}
                value={maxMinutes}
                onChange={(event) => setMaxMinutes(event.target.value)}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                placeholder="לדוגמה: 20"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void generateRecipe();
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && (
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  aria-hidden
                />
              )}
              {loading ? "מייצר מתכון..." : "יצירת מתכון"}
            </button>
            <button
              type="button"
              disabled
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-500 dark:border-zinc-700 dark:text-zinc-400"
              title="בקרוב"
            >
              הוסיפי כמתכון לאתר
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {error}
            </div>
          )}

          {recipe && (
            <div className="max-h-[45vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-2 dark:border-zinc-800 dark:bg-zinc-900">
              <AIRecipeResult recipe={recipe} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
