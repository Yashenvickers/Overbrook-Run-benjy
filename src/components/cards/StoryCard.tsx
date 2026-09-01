import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/types";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { formatDate, cn } from "@/lib/utils";

type Variant = "hero" | "lead" | "standard" | "compact";

/**
 * The editorial story card. Dimensions are always reserved via aspect-ratio
 * wrappers so images can never cause layout shift.
 */
export function StoryCard({
  article,
  variant = "standard",
  priority = false,
  className,
}: {
  article: Article;
  variant?: Variant;
  priority?: boolean;
  className?: string;
}) {
  const href = `/stories/${article.slug}`;

  if (variant === "hero") {
    return (
      <article className={cn("group relative", className)}>
        <div className="relative aspect-video w-full overflow-hidden bg-ink-soft">
          <Image
            src={article.hero.src}
            alt={article.hero.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 66vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" aria-hidden />
        </div>
        <div className="relative -mt-24 px-4 pb-2 sm:-mt-32 sm:px-6">
          <CategoryBadge category={article.category} />
          <h2 className="headline mt-2 text-3xl sm:text-5xl">
            <Link href={href} className="hover:text-signal focus-visible:text-signal">
              {article.title}
            </Link>
          </h2>
          <p className="mt-3 max-w-2xl text-base text-paper-dim sm:text-lg">{article.dek}</p>
          <p className="mt-3 text-sm text-paper-dim">
            {article.author.name} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </p>
          <Link
            href={href}
            className="mt-4 inline-flex min-h-11 items-center gap-2 bg-signal px-5 text-sm font-bold uppercase tracking-wider text-signal-ink transition-colors hover:bg-paper"
          >
            Read the story <span aria-hidden>→</span>
          </Link>
        </div>
      </article>
    );
  }

  if (variant === "lead") {
    return (
      <article className={cn("group", className)}>
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-ink-soft">
          <Image
            src={article.hero.src}
            alt={article.hero.alt}
            fill
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="pt-3">
          <CategoryBadge category={article.category} />
          <h3 className="headline mt-2 text-xl sm:text-2xl">
            <Link href={href} className="hover:text-signal focus-visible:text-signal">
              {article.title}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-paper-dim">{article.dek}</p>
          <p className="mt-2 text-xs text-paper-dim">
            {article.author.name} · <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </p>
        </div>
      </article>
    );
  }

  if (variant === "compact") {
    return (
      <article className={cn("group flex gap-4 border-b border-ink-line py-4", className)}>
        <div className="relative aspect-[3/2] w-28 shrink-0 overflow-hidden bg-ink-soft sm:w-36">
          <Image
            src={article.hero.src}
            alt={article.hero.alt}
            fill
            sizes="9rem"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <CategoryBadge category={article.category} />
          <h3 className="mt-1 font-bold leading-snug">
            <Link href={href} className="hover:text-signal focus-visible:text-signal">
              {article.title}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-paper-dim">
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className={cn("group", className)}>
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-ink-soft">
        <Image
          src={article.hero.src}
          alt={article.hero.alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
      </div>
      <div className="pt-3">
        <CategoryBadge category={article.category} />
        <h3 className="mt-2 text-lg font-bold leading-snug">
          <Link href={href} className="hover:text-signal focus-visible:text-signal">
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-paper-dim">{article.dek}</p>
        <p className="mt-2 text-xs text-paper-dim">
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </p>
      </div>
    </article>
  );
}
