import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { Article, SeedBlock } from "@/lib/types";

function PullQuote({ text, attribution }: { text: string; attribution?: string }) {
  return (
    <figure className="my-10 border-l-4 border-signal pl-5">
      <blockquote className="font-display text-2xl uppercase leading-tight text-paper sm:text-3xl">
        “{text}”
      </blockquote>
      {attribution ? (
        <figcaption className="mt-3 text-sm font-bold uppercase tracking-wider text-paper-dim">
          — {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}

function InlineImage({
  src,
  alt,
  credit,
}: {
  src: string;
  alt: string;
  credit?: string;
}) {
  if (!src) return null;
  return (
    <figure className="my-8">
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-ink-soft">
        <Image src={src} alt={alt} fill sizes="(min-width: 768px) 42rem, 100vw" className="object-cover" />
      </div>
      {credit ? (
        <figcaption className="mt-2 text-xs text-paper-dim">Photo: {credit}</figcaption>
      ) : null}
    </figure>
  );
}

const portableComponents: PortableTextComponents = {
  types: {
    pullQuote: ({ value }) => (
      <PullQuote text={value?.text ?? ""} attribution={value?.attribution} />
    ),
    articleImage: ({ value }) => (
      <InlineImage
        src={value?.url ?? value?.asset?.url ?? ""}
        alt={value?.alt ?? ""}
        credit={value?.credit}
      />
    ),
  },
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    link: ({ children, value }) => {
      const href: string = value?.href ?? "";
      const safe = href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://");
      if (!safe) return <>{children}</>;
      const external = !href.startsWith("/");
      return (
        <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {children}
        </a>
      );
    },
  },
};

function SeedBlocks({ blocks }: { blocks: SeedBlock[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "heading":
            return <h2 key={i}>{block.text}</h2>;
          case "pullQuote":
            return <PullQuote key={i} text={block.text} attribution={block.attribution} />;
          case "image":
            return (
              <InlineImage
                key={i}
                src={block.image.src}
                alt={block.image.alt}
                credit={block.image.credit}
              />
            );
          case "paragraph":
          default:
            return <p key={i}>{block.text}</p>;
        }
      })}
    </>
  );
}

/**
 * Article body renderer. CMS articles carry Portable Text; seed articles use
 * the lightweight block format. Both render into the same prose styles.
 */
export function ArticleBody({ article }: { article: Article }) {
  return (
    <div className="prose-dark">
      {Array.isArray(article.portableBody) && article.portableBody.length > 0 ? (
        <PortableText
          value={article.portableBody as Parameters<typeof PortableText>[0]["value"]}
          components={portableComponents}
        />
      ) : (
        <SeedBlocks blocks={article.body} />
      )}
    </div>
  );
}
