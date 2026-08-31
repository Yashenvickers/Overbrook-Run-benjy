# Preee TV

**Culture, music, and the conversations shaping what comes next.**

A culture-first digital media platform: editorial stories, video episodes, a culture calendar, artist submissions, and four conversion pipelines — built with Next.js (App Router), TypeScript, Tailwind CSS, Sanity, Supabase, and Resend.

> YOU DON'T KNOW ABOUT IT TILL WE TELL YOU ABOUT IT.

---

## Quick start (zero configuration)

The site runs fully with **no environment variables and no external services**: content comes from `data/seed-content.json` and the forms run in a clearly-labeled demo mode (validated server-side, nothing stored).

```bash
npm install
npm run dev        # http://localhost:3000
```

## Full verification

```bash
npm run verify     # lint → typecheck → unit tests → production build → Playwright e2e
```

Individual steps: `npm run lint`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:e2e` (first run: `npm run test:e2e:install` to fetch the Playwright browser). `npm run syntax-check` is a dependency-free syntax gate.

## What's inside

| Area | Where |
| --- | --- |
| Brand strings & navigation (single source of truth) | `src/config/site.ts` |
| Design tokens | `tailwind.config.ts`, `src/app/globals.css` |
| Content layer (Sanity ⇄ seed fallback) | `src/lib/content.ts`, `src/lib/sanity/*` |
| Seed content | `data/seed-content.json` |
| Sanity Studio (embedded at `/studio`) + schemas | `sanity.config.ts`, `sanity/schemas/*` |
| Lead pipelines (4 forms + newsletter) | `src/lib/leads.ts`, `src/components/forms/*`, `src/app/api/leads`, `src/app/api/newsletter` |
| Culture Calendar (list/month, filters, ICS) | `src/components/calendar/CalendarView.tsx`, `src/app/api/calendar/*` |
| Supabase schema | `supabase/migrations/0001_init.sql` |
| SEO (metadata, sitemap, robots, RSS, JSON-LD) | `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/feed.xml/route.ts`, `JsonLd` usages |
| Analytics events (typed) | `src/lib/analytics.ts` |
| Security headers / CSP | `next.config.ts` |
| Tests | `tests/e2e/*` (Playwright), `tests/unit/*` (Vitest) |

### Routes

`/` · `/latest` · `/music` · `/culture` · `/business` · `/interviews` · `/performances` · `/watch` · `/watch/[slug]` · `/stories/[slug]` · `/calendar` · `/search` · `/about` · `/submit-music` · `/request-interview` · `/book-promotion` · `/sponsor` · `/newsletter` · `/contact` · `/privacy` · `/terms` · `/submission-terms` · `/studio/[[...tool]]` · custom 404 + error states · `/feed.xml` · `/sitemap.xml` · `/robots.txt`

API: `POST /api/leads`, `POST /api/newsletter`, `POST /api/calendar/import` (secret header `x-preee-import-secret`), `GET /api/calendar/ics/[id]`, `GET /api/draft/enable|disable`.

## Connecting services (all optional, all independent)

Copy `.env.example` to `.env.local` and fill in what you have. Each service activates on its own:

1. **Sanity** — create a project, set `NEXT_PUBLIC_SANITY_PROJECT_ID` (+ dataset). The Studio mounts at `/studio`; content replaces the seed automatically once documents exist. Set `SANITY_API_READ_TOKEN` + `SANITY_PREVIEW_SECRET` for Draft Mode preview (`/api/draft/enable?secret=…&slug=/stories/…`).
2. **Supabase** — run `supabase/migrations/0001_init.sql` in the SQL editor, then set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (server-only; RLS is enabled with zero public policies, so the anon key can access nothing).
3. **Resend** — set `RESEND_API_KEY`, `LEADS_NOTIFY_EMAIL`, `LEADS_FROM_EMAIL` for internal notifications + confirmations.
4. **Turnstile** — set both `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`; the widget renders and server verification switches on automatically.
5. **Analytics** — `NEXT_PUBLIC_GA_MEASUREMENT_ID` for GA4; Vercel Analytics + Speed Insights activate automatically on Vercel.

## Deployment (Vercel)

1. Push the repo to GitHub and import it in Vercel (framework auto-detected).
2. Set `NEXT_PUBLIC_SITE_URL` to the production origin plus whichever service variables you have. Mark all non-`NEXT_PUBLIC` variables as server-only (default).
3. Add your domain; DNS per Vercel's instructions.
4. Post-deploy: verify `/sitemap.xml`, `/feed.xml`, and the security headers (`curl -I`).

Self-hosting works too: `npm run build && npm run start` behind any Node host.

## Editorial & media-rights guardrails

- Every CMS image requires **alt text** and a **rights status** (owned / guest-provided / press-approved / licensed / embedded / generated / unknown; licensed images take an expiry date). Publishing without them is blocked by schema validation.
- No scraped artist photography ships in this repo — all bundled imagery is generated abstract editorial art (`public/seed/`, rights status `generated`).
- YouTube is embedded via a poster-first facade (no third-party bytes until play; `youtube-nocookie.com`), never downloaded or re-hosted.
- Seed articles are explicitly evergreen/launch editorial (`evergreen: true`) — no fabricated reporting, dates, or sources.
- Sponsored content renders a prominent disclosure; corrections render on the story.

## Design & interaction rules honored

Mobile-first; no scroll hijacking, no smooth-scroll libraries, no full-page `100vh` wrappers (sections use `min-height:100dvh` where needed); a single sticky header with fixed height; the mobile menu locks body scroll only while open (restored on close/unmount/route change), traps focus, closes on Escape, and returns focus to its trigger; media dimensions are always reserved (zero CLS by construction); animations are transform/opacity only and respect `prefers-reduced-motion`; touch targets ≥ 44px; `overflow-x: clip` on body guards against horizontal scroll without breaking `position: sticky`.

## Notes & remaining external setup

See `docs/DECISIONS.md` for the design/copy/schema decisions made in this build and `docs/LAUNCH-CHECKLIST.md` for the short list of things only you can supply (API keys, real social URLs, approved logo files, production domain, legal review of the policy templates).
