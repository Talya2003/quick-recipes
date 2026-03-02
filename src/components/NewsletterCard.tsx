"use client";

import { FormEvent, useState } from "react";
import { track } from "@/lib/track";
import { cn } from "@/lib/utils";

interface NewsletterCardProps {
  compact?: boolean;
  source?: string;
}

export function NewsletterCard({ compact = false, source = "card" }: NewsletterCardProps) {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    const key = "quick_recipes_newsletter";
    const stored = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    const merged = Array.from(new Set([...stored, email.trim().toLowerCase()]));
    localStorage.setItem(key, JSON.stringify(merged));

    track("newsletter_signup", { source, email_domain: email.split("@")[1] ?? "" });
    setSuccess(true);
    setEmail("");
  };

  return (
    <section
      aria-labelledby="newsletter-title"
      className={cn(
        "rounded-2xl border border-brand-200 bg-gradient-to-l from-brand-50 to-white p-6 shadow-card dark:border-brand-800 dark:from-brand-950/50 dark:to-zinc-900",
        compact && "p-4"
      )}
    >
      <h2 id="newsletter-title" className={cn("font-bold text-zinc-900 dark:text-zinc-100", compact ? "text-base" : "text-2xl")}>
        קבלי מתכונים זריזים למייל
      </h2>
      <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">מייל קצר פעם בשבוע. בלי ספאם ובלי מתכונים מסובכים.</p>
      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
        <label htmlFor={`newsletter-email-${source}`} className="sr-only">
          אימייל
        </label>
        <input
          id={`newsletter-email-${source}`}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="הכניסי אימייל"
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none ring-brand-300 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          הירשמי
        </button>
      </form>
      {success && <p className="mt-3 text-sm font-medium text-brand-700 dark:text-brand-300">נשמר בהצלחה. נתראה במייל.</p>}
    </section>
  );
}
