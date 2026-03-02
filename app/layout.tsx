import type { Metadata } from "next";
import { Suspense } from "react";
import { Assistant, Rubik } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageViewTracker } from "@/components/PageViewTracker";
import { AIRecipeButton } from "@/components/AIRecipeButton";
import "../src/styles/globals.css";

const rubik = Rubik({
  subsets: ["hebrew", "latin"],
  variable: "--font-rubik",
  display: "swap"
});

const assistant = Assistant({
  subsets: ["hebrew", "latin"],
  variable: "--font-assistant",
  display: "swap"
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quick-recipes.local";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Quick & Minimal Recipes | מתכונים זריזים",
    template: "%s | Quick & Minimal Recipes"
  },
  description: "מתכונים מהירים באמת: מעט מצרכים, מעט דקות, הרבה טעם.",
  openGraph: {
    title: "Quick & Minimal Recipes",
    description: "מתכונים זריזים עם מינימום מצרכים וזמן.",
    type: "website",
    locale: "he_IL"
  },
  alternates: {
    canonical: "/"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body
        className={`${rubik.variable} ${assistant.variable} min-h-screen bg-zinc-50 font-[var(--font-assistant)] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100`}
      >
        <Suspense fallback={null}>
          <PageViewTracker />
        </Suspense>
        <Header />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
        <AIRecipeButton />
        <Footer />
      </body>
    </html>
  );
}
