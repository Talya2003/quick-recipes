"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { SUBMIT_RECIPE_DRAFT_KEY, type SubmitRecipeDraft } from "@/lib/aiRecipe";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { track } from "@/lib/track";

const emptyDraft: SubmitRecipeDraft = {
  name: "",
  minutes: "",
  ingredients: "",
  steps: "",
  tags: ""
};

function splitByLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitTags(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toDifficulty(minutes: number): "קל" | "בינוני" {
  return minutes <= 12 ? "קל" : "בינוני";
}

function buildDescription(values: SubmitRecipeDraft): string {
  const firstStep = splitByLines(values.steps)[0];
  if (firstStep) {
    return firstStep.slice(0, 120);
  }
  return "מתכון קהילה מהיר עם מעט מצרכים.";
}

function createRecipeText(values: SubmitRecipeDraft): string {
  const tagsLine = values.tags.trim() ? `\n\nתגיות: ${values.tags.trim()}` : "";
  return [
    `זמן כולל: ${values.minutes} דקות`,
    "",
    "מצרכים:",
    values.ingredients.trim(),
    "",
    "אופן הכנה:",
    values.steps.trim(),
    tagsLine
  ]
    .filter(Boolean)
    .join("\n");
}

export function SubmitRecipeForm() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadedFromAi, setLoadedFromAi] = useState(false);
  const [formValues, setFormValues] = useState<SubmitRecipeDraft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(SUBMIT_RECIPE_DRAFT_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as SubmitRecipeDraft;
      const hydrated: SubmitRecipeDraft = {
        name: String(parsed.name ?? ""),
        minutes: String(parsed.minutes ?? ""),
        ingredients: String(parsed.ingredients ?? ""),
        steps: String(parsed.steps ?? ""),
        tags: String(parsed.tags ?? "")
      };
      setFormValues(hydrated);
      setLoadedFromAi(true);
      localStorage.removeItem(SUBMIT_RECIPE_DRAFT_KEY);
    } catch {
      localStorage.removeItem(SUBMIT_RECIPE_DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const hydrateUser = async () => {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();

      if (active) {
        setUser(currentUser);
      }
    };

    void hydrateUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess(null);
    setError(null);

    track("submit_intent", {
      source: loadedFromAi ? "ai_draft" : "manual",
      name: formValues.name,
      minutes: formValues.minutes
    });

    if (!user) {
      setError("כדי לפרסם או לשמור מתכון, צריך להתחבר קודם.");
      return;
    }

    const minutes = Number(formValues.minutes);
    const ingredients = splitByLines(formValues.ingredients);
    const steps = splitByLines(formValues.steps);
    const tags = splitTags(formValues.tags);

    if (!Number.isFinite(minutes) || minutes <= 0) {
      setError("זמן הכנה לא תקין.");
      return;
    }

    if (ingredients.length < 2) {
      setError("צריך להזין לפחות שני מצרכים.");
      return;
    }

    if (steps.length < 2) {
      setError("צריך להזין לפחות שני שלבי הכנה.");
      return;
    }

    setSubmitting(true);
    const recipeText = createRecipeText(formValues);

    const [savedResult, publicResult] = await Promise.all([
      supabase.from("saved_recipes").insert({
        id: crypto.randomUUID(),
        user_id: user.id,
        title: formValues.name.trim(),
        recipe_text: recipeText
      }),
      supabase.from("public_recipes").insert({
        id: crypto.randomUUID(),
        author_id: user.id,
        title: formValues.name.trim(),
        description: buildDescription(formValues),
        minutes_total: minutes,
        difficulty: toDifficulty(minutes),
        ingredients,
        steps,
        tags,
        recipe_text: recipeText
      })
    ]);

    setSubmitting(false);

    const savedError = savedResult.error;
    const publicError = publicResult.error;

    if (!savedError && !publicError) {
      setSuccess("המתכון נשמר אצלך וגם פורסם למתכוני הקהילה.");
      setLoadedFromAi(false);
      setFormValues(emptyDraft);
      track("saved_recipe_add", { source: "submit_form" });
      track("public_recipe_publish", { source: "submit_form" });
      return;
    }

    if (!savedError && publicError) {
      setSuccess("המתכון נשמר אצלך, אבל הפרסום לקהילה נכשל כרגע.");
      setError("בדקי שהטבלה public_recipes קיימת ושיש לה Policies מתאימות.");
      track("saved_recipe_add", { source: "submit_form_partial" });
      return;
    }

    if (savedError && !publicError) {
      setSuccess("המתכון פורסם לקהילה, אבל לא נשמר לרשימה האישית.");
      setError("אפשר לשמור אותו מחדש מעמוד הקהילה.");
      track("public_recipe_publish", { source: "submit_form_partial" });
      return;
    }

    setError("שמירת המתכון נכשלה כרגע. נסי שוב.");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      {loadedFromAi && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
          הטופס מולא אוטומטית מהמתכון שנוצר ב-AI. אפשר לערוך לפני שליחה.
        </div>
      )}

      <label className="grid gap-1 text-sm font-medium">
        שם המתכון
        <input
          name="name"
          required
          value={formValues.name}
          onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium">
        זמן כולל (בדקות)
        <input
          name="minutes"
          type="number"
          min={1}
          required
          value={formValues.minutes}
          onChange={(event) => setFormValues((prev) => ({ ...prev, minutes: event.target.value }))}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium">
        מצרכים (שורה לכל מצרך)
        <textarea
          name="ingredients"
          rows={4}
          required
          value={formValues.ingredients}
          onChange={(event) => setFormValues((prev) => ({ ...prev, ingredients: event.target.value }))}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium">
        שלבי הכנה (שורה לכל שלב)
        <textarea
          name="steps"
          rows={5}
          required
          value={formValues.steps}
          onChange={(event) => setFormValues((prev) => ({ ...prev, steps: event.target.value }))}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium">
        תגיות
        <input
          name="tags"
          placeholder="לדוגמה: 5 דקות, 3 מצרכים"
          value={formValues.tags}
          onChange={(event) => setFormValues((prev) => ({ ...prev, tags: event.target.value }))}
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "שומר..." : "שלחי מתכון"}
      </button>

      {!user && (
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          כדי לפרסם מתכון לקהילה, צריך להתחבר.{" "}
          <Link href="/login?next=/submit" className="font-semibold text-brand-700 underline dark:text-brand-300">
            להתחברות
          </Link>
        </p>
      )}

      {success && <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{success}</p>}
      {error && <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>}
    </form>
  );
}

