import Link from "next/link";
import type { CategorySlug } from "@/lib/types";

const LABELS: Record<CategorySlug, string> = {
  music: "Music",
  culture: "Culture",
  business: "The Business",
  interviews: "Interviews",
  performances: "Performances",
};

export function categoryHref(slug: CategorySlug): string {
  return `/${slug}`;
}

export function categoryLabel(slug: CategorySlug): string {
  return LABELS[slug] ?? slug;
}

export function CategoryBadge({
  category,
  asLink = true,
}: {
  category: CategorySlug;
  asLink?: boolean;
}) {
  const label = categoryLabel(category);
  if (!asLink) {
    return <span className="kicker">{label}</span>;
  }
  return (
    <Link
      href={categoryHref(category)}
      className="kicker inline-flex min-h-6 items-center transition-colors hover:text-paper"
    >
      {label}
    </Link>
  );
}
