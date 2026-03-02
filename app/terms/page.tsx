import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "תנאי שימוש"
};

export default function TermsPage() {
  return (
    <article className="max-w-none rounded-2xl border border-zinc-200 bg-white p-6 shadow-card dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-3xl font-bold">תנאי שימוש</h1>
      <p className="mt-4 text-zinc-700 dark:text-zinc-200">זהו טקסט זמני לצורכי פיתוח. באתר המלא יופיעו תנאי שימוש משפטיים מלאים.</p>
      <p className="mt-3 text-zinc-700 dark:text-zinc-200">התכנים באתר ניתנים כהשראה כללית בלבד ואינם מהווים ייעוץ תזונתי או רפואי.</p>
    </article>
  );
}
