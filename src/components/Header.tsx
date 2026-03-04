"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AuthControls } from "@/components/AuthControls";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/recipes", label: "כל המתכונים" },
  { href: "/community", label: "מתכוני קהילה" },
  { href: "/categories", label: "קטגוריות" },
  { href: "/submit", label: "שלחי מתכון" },
  { href: "/about", label: "אודות" }
];

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-brand-700 dark:text-brand-300">
          Quick & Minimal Recipes
        </Link>

        <button
          type="button"
          className="inline-flex rounded-xl border border-zinc-300 px-3 py-2 text-sm font-medium md:hidden dark:border-zinc-700"
          aria-expanded={isOpen}
          aria-controls="mobile-nav"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          תפריט
        </button>

        <div className="hidden items-center gap-3 md:flex">
          <nav className="flex items-center gap-2" aria-label="ניווט ראשי">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:hover:bg-zinc-900",
                    isActive && "bg-brand-50 text-brand-800 dark:bg-brand-900/30 dark:text-brand-200"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <AuthControls />
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-label="ניווט מובייל"
        className={cn(
          "mx-auto w-full max-w-6xl overflow-hidden px-4 transition-all sm:px-6 lg:px-8 md:hidden",
          isOpen ? "max-h-[28rem] pb-4" : "max-h-0"
        )}
      >
        <div className="grid gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
          {navItems.map((item) => {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          <AuthControls mobile onAction={() => setIsOpen(false)} />
        </div>
      </nav>
    </header>
  );
}
