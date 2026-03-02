"use client";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="דפדוף עמודים">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700"
      >
        הקודם
      </button>
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`rounded-xl px-3 py-1.5 text-sm font-semibold transition ${
            page === currentPage
              ? "bg-brand-600 text-white"
              : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          }`}
        >
          {page}
        </button>
      ))}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl border border-zinc-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700"
      >
        הבא
      </button>
    </nav>
  );
}
