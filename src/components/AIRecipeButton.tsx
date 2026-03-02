"use client";

import { useState } from "react";
import { AIRecipeModal } from "@/components/AIRecipeModal";

export function AIRecipeButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-5 left-5 z-40 sm:bottom-6 sm:left-6">
        <button
          type="button"
          aria-label="יצירת מתכון מ-AI"
          title="יצירת מתכון מ-AI"
          onClick={() => setOpen(true)}
          className="group relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:scale-105 hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3z" />
            <path d="M19 14l.9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14z" />
          </svg>
          <span className="pointer-events-none absolute -top-10 right-1/2 translate-x-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100 dark:bg-zinc-100 dark:text-zinc-900">
            יצירת מתכון מ-AI
          </span>
        </button>
      </div>

      <AIRecipeModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
