"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { track } from "@/lib/track";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface SavedRecipeItem {
  id: string;
  title: string;
  recipe_text: string;
  created_at: string;
}

interface PublishedRecipeItem {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface AccountPanelProps {
  userId: string;
  userEmail: string;
  initialDisplayName: string;
  joinedAt: string | null;
  initialSavedRecipes: SavedRecipeItem[];
  initialPublishedRecipes: PublishedRecipeItem[];
}

export function AccountPanel({
  userId,
  userEmail,
  initialDisplayName,
  joinedAt,
  initialSavedRecipes,
  initialPublishedRecipes
}: AccountPanelProps) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [savedRecipes, setSavedRecipes] = useState(initialSavedRecipes);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeDeleteId, setActiveDeleteId] = useState<string | null>(null);
  const [copyId, setCopyId] = useState<string | null>(null);

  const saveDisplayName = async () => {
    setProfileStatus(null);
    setProfileError(null);

    const { error } = await supabase.from("profiles").update({ display_name: displayName.trim() || null }).eq("id", userId);

    if (error) {
      setProfileError("לא הצלחנו לשמור את השם כרגע.");
      return;
    }

    setProfileStatus("השם נשמר.");
    track("profile_update", { field: "display_name" });
  };

  const deleteRecipe = async (id: string) => {
    setActiveDeleteId(id);

    const { error } = await supabase.from("saved_recipes").delete().eq("id", id);

    setActiveDeleteId(null);
    if (error) {
      return;
    }

    setSavedRecipes((prev) => prev.filter((item) => item.id !== id));
    track("saved_recipe_delete", { id });
  };

  const copyRecipe = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopyId(id);
    window.setTimeout(() => setCopyId(null), 1600);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-xl font-bold">פרטי משתמש</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{userEmail}</p>
        {joinedAt && <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">משתמשת מאז {new Date(joinedAt).toLocaleDateString("he-IL")}</p>}

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-1 text-sm font-medium">
            שם להצגה
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              void saveDisplayName();
            }}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            שמירה
          </button>
        </div>

        {profileStatus && <p className="mt-2 text-sm text-brand-700 dark:text-brand-300">{profileStatus}</p>}
        {profileError && <p className="mt-2 text-sm text-red-700 dark:text-red-300">{profileError}</p>}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">מתכונים ששמרת</h2>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold dark:bg-zinc-800">{savedRecipes.length} מתכונים</span>
        </div>

        {savedRecipes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            עדיין אין מתכונים שמורים. אפשר לשמור מתכוני קהילה או לשמור מתכון שנוצר ב-AI.
          </p>
        ) : (
          <ul className="space-y-3" aria-label="רשימת מתכונים שמורים">
            {savedRecipes.map((recipe) => (
              <li key={recipe.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-base font-bold">{recipe.title}</h3>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(recipe.created_at).toLocaleDateString("he-IL")}</span>
                </div>

                <pre className="max-h-56 overflow-auto whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-950 dark:text-zinc-200">
                  {recipe.recipe_text}
                </pre>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      void copyRecipe(recipe.id, recipe.recipe_text);
                    }}
                    className="rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                  >
                    {copyId === recipe.id ? "הועתק" : "העתקת מתכון"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void deleteRecipe(recipe.id);
                    }}
                    disabled={activeDeleteId === recipe.id}
                    className="rounded-xl border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950/40"
                  >
                    {activeDeleteId === recipe.id ? "מוחקת..." : "מחיקה"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">מתכונים שפרסמת</h2>
          <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold dark:bg-zinc-800">
            {initialPublishedRecipes.length} מתכונים
          </span>
        </div>

        {initialPublishedRecipes.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-4 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
            עדיין לא פרסמת מתכונים לקהילה. אפשר לפרסם דרך עמוד{" "}
            <Link href="/submit" className="font-semibold text-brand-700 underline dark:text-brand-300">
              שלחי מתכון
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3" aria-label="רשימת מתכונים שפורסמו">
            {initialPublishedRecipes.map((recipe) => (
              <li key={recipe.id} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <Link href={`/community/${recipe.id}`} className="text-base font-bold hover:text-brand-700 dark:hover:text-brand-300">
                    {recipe.title}
                  </Link>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(recipe.created_at).toLocaleDateString("he-IL")}</span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">{recipe.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

