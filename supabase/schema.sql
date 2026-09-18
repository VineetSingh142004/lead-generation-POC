-- ============================================================================
-- Epoxy Atelier — database schema
-- Apply in the Supabase SQL editor, then create the storage bucket at the end.
-- ============================================================================

-- ---------------------------------------------------------------- leads ----
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (length(name) between 1 and 120),
  phone text not null check (length(phone) between 7 and 24),
  address text not null check (length(address) between 1 and 200),
  -- Optional: only present when the customer asked for a confirmation copy.
  email text check (email is null or length(email) <= 254),
  -- Service values come from the editable content (config in lib/content.ts, or the
  -- site_content row). Deliberately NOT a CHECK constraint: services are swapped per
  -- business from /admin, and a hardcoded constraint would need a migration every time.
  service text not null check (length(service) between 1 and 120),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- -------------------------------------------------------- site content ----
-- One row holding the whole editable site as jsonb, written by /admin.
create table if not exists public.site_content (
  id text primary key default 'default',
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ------------------------------------------------------------------ RLS ----
-- Both tables run RLS ON with ZERO POLICIES, and that is intentional.
--
-- The anon/public key therefore cannot read or write either table. All access goes
-- through server routes using SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS and never
-- reaches the browser.
--
-- DO NOT add a permissive policy such as `for select using (true)` on leads: that table
-- holds customer names, phone numbers and street addresses, and one careless policy
-- makes every one of them world-readable.
alter table public.leads enable row level security;
alter table public.site_content enable row level security;

-- -------------------------------------------------------------- storage ----
-- Bucket for images uploaded from /admin. Public read, writes only via the service role.
insert into storage.buckets (id, name, public)
values ('site-photos', 'site-photos', true)
on conflict (id) do nothing;

-- Public read of the bucket's objects (images are meant to be shown on the site).
drop policy if exists "site photos are publicly readable" on storage.objects;
create policy "site photos are publicly readable"
  on storage.objects for select
  using (bucket_id = 'site-photos');
