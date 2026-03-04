import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "האזור האישי",
  description: "ניהול מתכונים שמורים ופרופיל משתמש."
};

export default async function AccountPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [{ data: profile }, { data: savedRecipes }] = await Promise.all([
    supabase.from("profiles").select("display_name, created_at").eq("id", user.id).maybeSingle(),
    supabase
      .from("saved_recipes")
      .select("id, title, recipe_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">האזור האישי</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">כאן נשמרים כל המתכונים שלך מה-AI ומטופס השליחה.</p>
      </header>

      <AccountPanel
        userId={user.id}
        userEmail={user.email ?? ""}
        initialDisplayName={profile?.display_name ?? ""}
        joinedAt={profile?.created_at ?? null}
        initialRecipes={savedRecipes ?? []}
      />
    </div>
  );
}
