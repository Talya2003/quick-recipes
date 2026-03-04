"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { track } from "@/lib/track";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const rawNextPath = searchParams.get("next") || "/account";
  const nextPath = rawNextPath.startsWith("/") ? rawNextPath : "/account";

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    if (password.length < 6) {
      setLoading(false);
      setError("הסיסמה חייבת להכיל לפחות 6 תווים.");
      return;
    }

    if (mode === "login") {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);

      if (signInError) {
        setError(signInError.message);
        return;
      }

      track("login", { method: "email_password" });
      if (data.user) {
        router.replace(nextPath);
        router.refresh();
      }
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim() || null
        }
      }
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    track("signup", { method: "email_password" });

    if (data.session) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    setMessage("ההרשמה בוצעה. אם הגדרתם אימות מייל ב-Supabase, צריך לאשר את המייל ואז להתחבר.");
  };

  return (
    <section className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 flex gap-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800" role="tablist" aria-label="סוג פעולה">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => setMode("login")}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
            mode === "login" ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300"
          )}
        >
          התחברות
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => setMode("signup")}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition",
            mode === "signup" ? "bg-white text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-300"
          )}
        >
          הרשמה
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "signup" && (
          <label className="grid gap-1 text-sm font-medium">
            שם להצגה (אופציונלי)
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
              placeholder="למשל: נועה"
              autoComplete="nickname"
            />
          </label>
        )}

        <label className="grid gap-1 text-sm font-medium">
          אימייל
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            autoComplete="email"
          />
        </label>

        <label className="grid gap-1 text-sm font-medium">
          סיסמה
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-xl border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-950"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "מעבד..." : mode === "login" ? "התחברות" : "יצירת חשבון"}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      )}

      {message && (
        <p className="mt-3 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-800 dark:border-brand-900 dark:bg-brand-950/40 dark:text-brand-200">
          {message}
        </p>
      )}
    </section>
  );
}
