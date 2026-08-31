"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_NAME, NAV_ITEMS } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Sticky site header. One sticky element only (never competes with another),
 * fixed height so it can never cause layout jumps. The mobile menu locks body
 * scroll only while open and restores it reliably (including on unmount),
 * traps focus, closes on Escape, and returns focus to its trigger.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  const close = useCallback(() => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Close the menu on route change.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Body scroll lock while (and only while) the menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  // Focus trap + Escape handling while open.
  useEffect(() => {
    if (!menuOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    const focusables = () =>
      Array.from(
        menu.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, close]);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-line bg-ink/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 w-full max-w-site items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2"
          aria-label={`${BRAND_NAME} home`}
        >
          <span className="flex h-9 w-9 items-center justify-center bg-paper font-display text-xl text-ink">
            P<span className="text-signal">.</span>
          </span>
          <span className="font-display text-lg uppercase tracking-tight">
            Preee <span className="text-signal">TV</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center text-sm font-bold uppercase tracking-wider transition-colors hover:text-signal",
                    pathname === item.href ? "text-signal" : "text-paper",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="inline-flex h-11 w-11 items-center justify-center text-paper transition-colors hover:text-signal"
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
          <Link
            href="/watch"
            className="hidden min-h-11 items-center bg-signal px-4 text-sm font-bold uppercase tracking-wider text-signal-ink transition-colors hover:bg-paper sm:inline-flex"
          >
            ▶ Watch
          </Link>
          <button
            ref={triggerRef}
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center text-paper transition-colors hover:text-signal lg:hidden"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 5 19 19M19 5 5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-ink animate-fade-in lg:hidden"
        >
          <nav aria-label="Mobile" className="px-4 py-6 sm:px-6">
            <ul className="flex flex-col divide-y divide-ink-line">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex min-h-14 items-center font-display text-2xl uppercase transition-colors hover:text-signal",
                      pathname === item.href ? "text-signal" : "text-paper",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-1 gap-3">
              <Link
                href="/submit-music"
                className="flex min-h-12 items-center justify-center bg-signal px-4 font-bold uppercase tracking-wider text-signal-ink"
              >
                Submit Music
              </Link>
              <Link
                href="/newsletter"
                className="flex min-h-12 items-center justify-center border-2 border-paper px-4 font-bold uppercase tracking-wider text-paper"
              >
                Get the Newsletter
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
