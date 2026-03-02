interface TagChipsProps {
  tags: string[];
}

export function TagChips({ tags }: TagChipsProps) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="תגיות">
      {tags.map((tag) => (
        <li key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          #{tag}
        </li>
      ))}
    </ul>
  );
}
