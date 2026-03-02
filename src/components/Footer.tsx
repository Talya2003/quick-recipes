"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { track } from "@/lib/track";

const footerLinks = [
  { href: "/privacy", label: "פרטיות" },
  { href: "/terms", label: "תנאים" },
  { href: "/about", label: "אודות" }
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return;

    const key = "quick_recipes_newsletter";
    const existing = JSON.parse(localStorage.getItem(key) ?? "[]") as string[];
    const merged = Array.from(new Set([...existing, email.trim().toLowerCase()]));
    localStorage.setItem(key, JSON.stringify(merged));
    track("newsletter_signup", { placement: "footer", email_domain: email.split("@")[1] ?? "" });
    setDone(true);
    setEmail("");
  };

  return (
    <footer className="mt-20 border-t border-zinc-200 bg-zinc-100/70 dark:border-zinc-800 dark:bg-zinc-900/50">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
        <section aria-labelledby="footer-newsletter">
          <h2 id="footer-newsletter" className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            קבלי מתכונים זריזים למייל
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">פעם בשבוע, רק מתכונים קצרים באמת.</p>
          <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
            <label className="sr-only" htmlFor="footer-email">
              אימייל
            </label>
            <input
              id="footer-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="האימייל שלך"
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm outline-none ring-brand-300 transition focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950"
              required
            />
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              הירשמי
            </button>
          </form>
          {done && <p className="mt-3 text-sm font-medium text-brand-700 dark:text-brand-300">נרשמת בהצלחה.</p>}
        </section>

        <section aria-label="קישורים">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">קישורים</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {footerLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-zinc-700 underline-offset-4 hover:underline dark:text-zinc-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </footer>
  );
}
