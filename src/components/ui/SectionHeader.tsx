import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeader({
  kicker,
  title,
  href,
  linkLabel = "View all",
  className,
  id,
}: {
  kicker?: string;
  title: string;
  href?: string;
  linkLabel?: string;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn("mb-6 flex items-end justify-between gap-4 border-b-2 border-paper pb-3", className)}>
      <div>
        {kicker ? <p className="kicker mb-2">{kicker}</p> : null}
        <h2 id={id} className="headline text-2xl sm:text-3xl">{title}</h2>
      </div>
      {href ? (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-bold uppercase tracking-wider text-paper-dim transition-colors hover:text-signal"
        >
          {linkLabel} <span aria-hidden>→</span>
        </Link>
      ) : null}
    </div>
  );
}
