"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { track } from "@/lib/track";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type SaveState = "idle" | "saving" | "saved" | "error" | "own";

interface PublicRecipeSaveButtonProps {
  recipeId: string;
  authorId: string;
  title: string;
  recipeText: string;
  className?: string;
}

export function PublicRecipeSaveButton({
  recipeId,
  authorId,
  title,
  recipeText,
  className
}: PublicRecipeSaveButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [state, setState] = useState<SaveState>("idle");

  const saveToMyList = async () => {
    if (state === "saving") return;

    setState("saving");

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setState("idle");
      router.push(`/login?next=${encodeURIComponent(pathname || "/community")}`);
      return;
    }

    if (user.id === authorId) {
      setState("own");
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from("saved_recipes")
      .select("id")
      .eq("user_id", user.id)
      .eq("title", title)
      .eq("recipe_text", recipeText)
      .limit(1);

    if (existingError) {
      setState("error");
      return;
    }

    if (existing && existing.length > 0) {
      setState("saved");
      return;
    }

    const { error } = await supabase.from("saved_recipes").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      title,
      recipe_text: recipeText
    });

    if (error) {
      setState("error");
      return;
    }

    setState("saved");
    track("saved_recipe_add", { source: "public_recipe", public_recipe_id: recipeId });
  };

  const labelByState: Record<SaveState, string> = {
    idle: "שמירה לרשימה שלי",
    saving: "שומר...",
    saved: "נשמר",
    error: "נסי שוב",
    own: "זה המתכון שלך"
  };

  return (
    <button
      type="button"
      onClick={() => {
        void saveToMyList();
      }}
      disabled={state === "saving" || state === "own"}
      className={
        className ??
        "rounded-xl border border-zinc-300 px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:hover:bg-zinc-800"
      }
    >
      {labelByState[state]}
    </button>
  );
}

