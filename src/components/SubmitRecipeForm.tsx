"use client";

import { FormEvent, useEffect, useState } from "react";
import { SUBMIT_RECIPE_DRAFT_KEY, type SubmitRecipeDraft } from "@/lib/aiRecipe";
import { track } from "@/lib/track";

const emptyDraft: SubmitRecipeDraft = {
  name: "",
  minutes: "",
  ingredients: "",
  steps: "",
  tags: ""
};

export function SubmitRecipeForm() {
  const [success, setSuccess] = useState(false);
  const [loadedFromAi, setLoadedFromAi] = useState(false);
  const [formValues, setFormValues] = useState<SubmitRecipeDraft>(emptyDraft);

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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    track("submit_intent", {
      source: loadedFromAi ? "ai_draft" : "manual",
      name: formValues.name,
      minutes: formValues.minutes
    });

    setSuccess(true);
    setLoadedFromAi(false);
    setFormValues(emptyDraft);
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

      <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
        שלחי מתכון
      </button>

      {success && <p className="text-sm font-medium text-brand-700 dark:text-brand-300">תודה. הפיצ׳ר המלא יעלה בקרוב (Coming Soon).</p>}
    </form>
  );
}
