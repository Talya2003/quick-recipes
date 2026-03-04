"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { track } from "@/lib/track";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AuthControlsProps {
  mobile?: boolean;
  onAction?: () => void;
}

export function AuthControls({ mobile = false, onAction }: AuthControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    let active = true;

    const hydrateUser = async () => {
      const {
        data: { user: currentUser }
      } = await supabase.auth.getUser();

      if (active) {
        setUser(currentUser);
        setLoading(false);
      }
    };

    void hydrateUser();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const onSignOut = async () => {
    setIsSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setIsSigningOut(false);

    if (error) {
      return;
    }

    track("logout", { path: pathname });
    onAction?.();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return <span className="h-9 w-24 animate-pulse rounded-xl bg-zinc-200/80 dark:bg-zinc-800" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(pathname || "/")}`}
        onClick={onAction}
        className={cn(
          "rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800",
          mobile && "text-center"
        )}
      >
        התחברות
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", mobile && "flex-col")}> 
      <Link
        href="/account"
        onClick={onAction}
        className={cn(
          "rounded-xl bg-brand-50 px-3 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-200 dark:hover:bg-brand-900/50",
          mobile && "w-full text-center"
        )}
      >
        האזור האישי
      </Link>
      <button
        type="button"
        onClick={() => {
          void onSignOut();
        }}
        disabled={isSigningOut}
        className={cn(
          "rounded-xl border border-zinc-300 px-3 py-2 text-sm font-semibold hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-zinc-700 dark:hover:bg-zinc-800",
          mobile && "w-full"
        )}
      >
        {isSigningOut ? "מתנתקת..." : "יציאה"}
      </button>
    </div>
  );
}
