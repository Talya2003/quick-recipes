"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { AIRecipeResult } from "@/components/AIRecipeResult";
import { extractMinutes, parseAIRecipe, SUBMIT_RECIPE_DRAFT_KEY, type SubmitRecipeDraft } from "@/lib/aiRecipe";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
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
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [ingredientsText, setIngredientsText] = useState("");
  const [mealType, setMealType] = useState<string>("");
  const [maxMinutes, setMaxMinutes] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const ingredients = useMemo(() => parseIngredients(ingredientsText), [ingredientsText]);

  useEffect(() => {
    let active = true;

    const hydrateUser = async () => {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();

      if (active) {
        setUser(currentUser);
        setAuthLoading(false);
      }
    };

    void hydrateUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

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
    setSuccessMessage(null);

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

  const addRecipeToSite = async () => {
    if (!recipe) return;

    setError(null);
    setSuccessMessage(null);

    const parsed = parseAIRecipe(recipe);

    if (user) {
      setSaveLoading(true);
      const { error: insertError } = await supabase.from("saved_recipes").insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        title: parsed.title || "מתכון AI",
        recipe_text: recipe
      });
      setSaveLoading(false);

      if (insertError) {
        setError("לא הצלחנו לשמור את המתכון לחשבון כרגע.");
        return;
      }

      setSuccessMessage("המתכון נשמר לחשבון שלך באזור האישי.");
      track("saved_recipe_add", { source: "ai_modal", ingredients_count: ingredients.length });
      return;
    }

    const fallbackIngredients = ingredients.map((item) => `${item} - לפי הצורך`);
    const draft: SubmitRecipeDraft = {
      name: parsed.title || "מתכון AI",
      minutes: extractMinutes(parsed.prepTime, maxMinutes.trim() || "10"),
      ingredients: (parsed.ingredients.length ? parsed.ingredients : fallbackIngredients).join("\n"),
      steps: parsed.steps.join("\n"),
      tags: [mealType || "", "AI"].filter(Boolean).join(", ")
    };

    localStorage.setItem(SUBMIT_RECIPE_DRAFT_KEY, JSON.stringify(draft));
    setSuccessMessage("הטיוטה נשמרה מקומית. מעבירה לעמוד שליחת מתכון...");
    track("submit_intent", { source: "ai_recipe_guest", name: draft.name, minutes: draft.minutes });

    window.setTimeout(() => {
      onClose();
      router.push("/submit");
    }, 450);
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
              onClick={() => {
                void addRecipeToSite();
              }}
              disabled={!recipe || loading || saveLoading || authLoading}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
            >
              {saveLoading ? "שומר..." : user ? "שמירה לחשבון" : "הוסיפי כמתכון לאתר"}
            </button>
          </div>

          {!user && !authLoading && (
            <p className="text-xs text-zinc-600 dark:text-zinc-300">כדי לשמור ישירות לענן, התחברי ואז שמרי מהמודאל.</p>
          )}

          {successMessage && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
              {successMessage}
            </div>
          )}

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
