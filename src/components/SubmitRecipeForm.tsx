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
      setError("כדי לשמור מתכון בענן צריך להתחבר קודם.");
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from("saved_recipes").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      title: formValues.name.trim(),
      recipe_text: createRecipeText(formValues)
    });

    setSubmitting(false);

    if (insertError) {
      setError("שמירת המתכון נכשלה כרגע. נסי שוב.");
      return;
    }

    setSuccess("המתכון נשמר בהצלחה באזור האישי.");
    setLoadedFromAi(false);
    setFormValues(emptyDraft);
    track("saved_recipe_add", { source: "submit_form" });
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
          כדי לשמור מתכון לחשבון, צריך להתחבר. <Link href="/login?next=/submit" className="font-semibold text-brand-700 underline dark:text-brand-300">להתחברות</Link>
        </p>
      )}

      {success && <p className="text-sm font-medium text-brand-700 dark:text-brand-300">{success}</p>}
      {error && <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>}
    </form>
  );
}
