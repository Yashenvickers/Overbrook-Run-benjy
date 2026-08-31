import Link from "next/link";
import { cn } from "@/lib/utils";

const styles = {
  primary:
    "bg-signal text-signal-ink hover:bg-paper focus-visible:bg-paper",
  secondary:
    "border-2 border-paper text-paper hover:border-signal hover:text-signal",
  ghost: "text-paper-dim hover:text-signal",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  ...rest
}: {
  href: string;
  children: React.ReactNode;
  variant?: keyof typeof styles;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 text-sm font-bold uppercase tracking-wider transition-colors",
        styles[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </Link>
  );
}
