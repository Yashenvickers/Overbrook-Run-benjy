-- Preee TV — initial schema for form submissions, newsletter, and calendar imports.
-- All access from the app uses the service-role key server-side only.
-- Row Level Security is enabled with NO public policies: the anon key can read/write nothing.

create extension if not exists pgcrypto;

-- ── Leads: submit music / request interview / book promotion / sponsor ──────
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null check (type in ('submit_music', 'request_interview', 'book_promotion', 'sponsor')),
  email text not null,
  contact_name text not null,
  payload jsonb not null,
  utm jsonb,
  referrer text,
  consent_at timestamptz not null,
  user_agent text,
  status text not null default 'new' check (status in ('new', 'reviewing', 'responded', 'archived', 'spam'))
);

create index if not exists leads_type_created_idx on public.leads (type, created_at desc);
create index if not exists leads_email_idx on public.leads (email);

alter table public.leads enable row level security;

-- ── Newsletter subscribers ──────────────────────────────────────────────────
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null unique,
  location text,
  referrer text,
  consent_at timestamptz not null,
  unsubscribed_at timestamptz
);

create index if not exists newsletter_email_idx on public.newsletter_subscribers (email);

alter table public.newsletter_subscribers enable row level security;

-- ── Imported calendar events (automation inbox — reviewed before publish) ──
create table if not exists public.imported_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null,
  external_id text not null,
  payload jsonb not null,
  reviewed boolean not null default false,
  unique (external_id, source)
);

alter table public.imported_events enable row level security;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists imported_events_touch on public.imported_events;
create trigger imported_events_touch
  before update on public.imported_events
  for each row execute function public.touch_updated_at();

-- No RLS policies are created on purpose: with RLS enabled and zero policies,
-- anon/authenticated roles have no access. The service-role key (server-only)
-- bypasses RLS.
