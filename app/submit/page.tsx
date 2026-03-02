import type { Metadata } from "next";
import { SubmitRecipeForm } from "@/components/SubmitRecipeForm";

export const metadata: Metadata = {
  title: "שלחי מתכון",
  description: "שליחת רעיון למתכון מהיר - בקרוב נפתח קליטה מלאה."
};

export default function SubmitPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">שלחי מתכון</h1>
        <p className="text-zinc-600 dark:text-zinc-300">יש לך רעיון למתכון קצר? נשמח לשמוע. כרגע נשמר רק מקומית בדפדפן.</p>
      </header>
      <SubmitRecipeForm />
    </div>
  );
}
