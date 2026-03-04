import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountPanel } from "@/components/AccountPanel";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "האזור האישי",
  description: "ניהול פרופיל, מתכונים שמורים ומתכונים שפרסמת לקהילה."
};

export default async function AccountPage() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [{ data: profile }, { data: savedRecipes }, { data: publishedRecipes }] = await Promise.all([
    supabase.from("profiles").select("display_name, created_at").eq("id", user.id).maybeSingle(),
    supabase
      .from("saved_recipes")
      .select("id, title, recipe_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("public_recipes")
      .select("id, title, description, created_at")
      .eq("author_id", user.id)
      .order("created_at", { ascending: false })
  ]);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-3xl font-bold">האזור האישי</h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">
          כאן תנהלי את הפרופיל שלך, מתכונים ששמרת, ומתכונים שפרסמת לצפייה לכל המשתמשים.
        </p>
      </header>

      <AccountPanel
        userId={user.id}
        userEmail={user.email ?? ""}
        initialDisplayName={profile?.display_name ?? ""}
        joinedAt={profile?.created_at ?? null}
        initialSavedRecipes={savedRecipes ?? []}
        initialPublishedRecipes={publishedRecipes ?? []}
      />
    </div>
  );
}

