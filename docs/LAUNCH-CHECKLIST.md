# Launch checklist — things only you can supply

Everything below is external setup; the codebase is complete without it.

1. **Domain & hosting** — production domain DNS pointed at Vercel (or your host); set `NEXT_PUBLIC_SITE_URL`.
2. **Sanity project** — create at sanity.io/manage; set `NEXT_PUBLIC_SANITY_PROJECT_ID`, dataset, `SANITY_API_READ_TOKEN`, `SANITY_PREVIEW_SECRET`. Add CORS origin for your domain in Sanity manage. Recreate the five categories (music, culture, business, interviews, performances) as `category` documents with those exact slugs.
3. **Supabase project** — run `supabase/migrations/0001_init.sql`; set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
4. **Resend** — verify a sending domain; set `RESEND_API_KEY`, `LEADS_FROM_EMAIL`, `LEADS_NOTIFY_EMAIL`.
5. **Turnstile** — create a widget for your domain; set both keys.
6. **Calendar automation** (optional) — set `CALENDAR_IMPORT_SECRET` and point your importer at `POST /api/calendar/import`.
7. **Approved logo** — replace `public/brand/favicon.svg`, `public/brand/logo-mark.png`, and `public/brand/og-default.jpg` with final brand assets (the header wordmark is text and follows automatically).
8. **Real social URLs** — fill in `SOCIAL_LINKS` in `src/config/site.ts` (icons stay hidden until URLs exist).
9. **Contact email** — replace the placeholder `CONTACT_EMAIL` in `src/config/site.ts`.
10. **Legal review** — `/privacy`, `/terms`, `/submission-terms` are labeled launch templates; have counsel review.
11. **Analytics** — optionally set `NEXT_PUBLIC_GA_MEASUREMENT_ID`; Vercel Analytics activates on deploy.
12. **First real content** — replace seed spotlight slots and "coming soon" episodes as real inventory lands; flip `AD_INVENTORY_ENABLED` only when partner inventory exists.
