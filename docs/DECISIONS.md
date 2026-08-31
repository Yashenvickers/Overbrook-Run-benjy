# Build decisions

The master prompt referenced companion spec files (02 site map, 03 design system, 04 CMS schema, 05 forms & leads, 06 components) that were not supplied with the build request. This document records the decisions made in their place so they can be reconciled if those files surface.

## Design system (in place of 03)

- **Palette** — "music newsroom after dark": ink `#0A0A0B` ground, raised surface `#121214`, hairline `#26262A`, paper `#FAFAF7` text, dim text `#A6A6AD` (AA on ink), signal yellow `#F5E003` with `#141400` for text on yellow (AAA), live red `#FF3B30` for the now-bar dot only.
- **Type** — Archivo Black (display, uppercase, tight leading via `.headline`) + Inter (body/UI), loaded with `next/font` and CSS variables. Kicker style: 11px, bold, 0.14em tracking, signal yellow.
- **Shape & texture** — sharp corners everywhere (no border radius), 1–2px borders, black/white blocks with yellow accents; the newsletter band inverts to solid yellow.
- **Motion** — hover scale on imagery (transform-only), fade-in for the mobile menu; everything collapses under `prefers-reduced-motion`.

## Forms & leads (in place of 05)

Field sets and copy were authored for the four flows (see `src/components/forms/leadFieldSpecs.tsx` and `src/lib/leads.ts`); all flows share honeypot, UTM/referrer capture, consent timestamp, optional Turnstile, and rate limiting. Budget ranges: promotion (under $1k → $15k+), sponsorship (under $5k → $100k+), both with "not sure". No file uploads — links only, per the master prompt.

## CMS schema (in place of 04)

Types: `article`, `author`, `category`, `videoEpisode`, `shortClip`, `event`, `artistProfile`, `sponsor`, `homepageSettings`, `siteSettings`, `breakingItem`, `correction`, plus the `editorialImage` object carrying alt/credit/source/rights-status/expiry on every image. Corrections exist both inline on `article` (rendered) and as an audit-log document.

## Content source strategy

`src/lib/content.ts` is the single content gateway: Sanity when configured (with draft-mode preview), bundled seed otherwise, identical types either way. This satisfies "no external service for first run" without forking any page logic.

## Known v1 simplifications (documented, non-blocking)

- `homepageSettings`/`siteSettings` documents exist in the CMS for featured-content and social-link control, but the homepage currently derives its hero from the newest `featured` article and social URLs from `src/config/site.ts`. Wiring the settings documents into the queries is a small follow-up once a Sanity project exists to test against.
- Search is server-rendered substring matching over the content set — the right scale for launch inventory; swap for Sanity GROQ scoring or an index when the archive grows.
- The calendar import endpoint stores to a review inbox table (`imported_events`) rather than auto-publishing, by design.
- Rate limiting is per-instance in-memory; move to a shared store if abuse appears.
- The `/watch` video feed (RSS) was skipped as impractical without real video URLs; the article RSS feed ships at `/feed.xml`.
