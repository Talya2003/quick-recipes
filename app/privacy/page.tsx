import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "מדיניות פרטיות"
};

export default function PrivacyPage() {
  return (
    <article className="max-w-none rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-3xl font-bold">מדיניות פרטיות</h1>
      <p className="mt-4 text-zinc-700 dark:text-zinc-200">זהו טקסט זמני לצורכי פיתוח. באתר המלא תופיע מדיניות פרטיות מפורטת.</p>
      <p className="mt-3 text-zinc-700 dark:text-zinc-200">כרגע אין התחברות משתמשים. נתוני ניוזלטר נשמרים מקומית בדפדפן בלבד לצורך הדגמה.</p>
    </article>
  );
}
