import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "התחברות",
  description: "התחברות לאזור האישי לשמירת מתכוני AI ומתכונים שנשלחו."
};

interface LoginPageProps {
  searchParams?: {
    next?: string;
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const rawNext = searchParams?.next || "/account";
  const safeNext = rawNext.startsWith("/") ? rawNext : "/account";

  if (user) {
    redirect(safeNext);
  }

  return (
    <div className="space-y-4">
      <header className="text-center">
        <h1 className="text-3xl font-bold">התחברות והרשמה</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">כניסה מהירה כדי לשמור מתכונים שיצרת ב-AI ולנהל אותם.</p>
      </header>
      <AuthForm />
    </div>
  );
}
