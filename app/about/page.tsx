import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "אודות",
  description: "למה הקמנו את Quick & Minimal Recipes ומה אנחנו מבטיחים."
};

export default function AboutPage() {
  return (
    <div className="space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-3xl font-bold">אודות</h1>
      <p className="text-zinc-700 dark:text-zinc-200">Quick & Minimal Recipes נולד מתוך צורך אמיתי: לבשל משהו טוב גם כשאין זמן.</p>
      <h2 className="text-xl font-bold">ההבטחה שלנו</h2>
      <ul className="list-disc space-y-2 pr-5 text-zinc-700 dark:text-zinc-200">
        <li>מהיר: מתכונים קצרים באמת.</li>
        <li>מינימום מצרכים: רשימות ברורות בלי עומס.</li>
        <li>ברור: הוראות קצרות שקל לבצע.</li>
      </ul>
    </div>
  );
}
