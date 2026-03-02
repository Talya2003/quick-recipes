import { type CategorySlug, categories } from "@/data/recipes";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatMinutes(value: number): string {
  return `מוכן תוך ${value} דק׳`;
}

export function getCategoryMeta(category: CategorySlug) {
  return categories.find((item) => item.slug === category) ?? categories[0];
}

export function slugToCategory(slug: string): CategorySlug | null {
  const normalized = slug.toLowerCase();
  const match = categories.find((item) => item.slug === normalized);
  return match?.slug ?? null;
}

export function formatPublishedDate(date: string): string {
  return new Intl.DateTimeFormat("he-IL", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}
