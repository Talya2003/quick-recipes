import Link from "next/link";

interface Crumb {
  href: string;
  label: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="פירורי לחם" className="text-sm text-zinc-600 dark:text-zinc-300">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:underline">
            בית
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.href} className="flex items-center gap-2">
            <span aria-hidden>›</span>
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
