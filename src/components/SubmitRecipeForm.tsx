"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/track";

export function SubmitRecipeForm() {
  const [success, setSuccess] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    track("submit_intent", {
      name: String(data.get("name") ?? ""),
      minutes: String(data.get("minutes") ?? "")
    });

    setSuccess(true);
    event.currentTarget.reset();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <label className="grid gap-1 text-sm font-medium">
        שם המתכון
        <input name="name" required className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950" />
      </label>

      <label className="grid gap-1 text-sm font-medium">
        זמן כולל (בדקות)
        <input
          name="minutes"
          type="number"
          min={1}
          required
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium">
        מצרכים (שורה לכל מצרך)
        <textarea
          name="ingredients"
          rows={4}
          required
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium">
        שלבי הכנה (שורה לכל שלב)
        <textarea
          name="steps"
          rows={4}
          required
          className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium">
        תגיות
        <input name="tags" placeholder="לדוגמה: 5 דקות, 3 מצרכים" className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950" />
      </label>

      <button type="submit" className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
        שלחי מתכון
      </button>

      {success && <p className="text-sm font-medium text-brand-700 dark:text-brand-300">תודה. הפיצ׳ר המלא יעלה בקרוב (Coming Soon).</p>}
    </form>
  );
}
