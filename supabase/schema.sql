-- Leads table for the epoxy flooring lead-generation POC.
-- Apply in the Supabase SQL editor before enabling live capture.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (length(name) between 1 and 120),
  phone text not null check (length(phone) between 7 and 24),
  address text not null check (length(address) between 1 and 200),
  -- Optional: only present when the customer asked for a confirmation copy.
  email text check (email is null or length(email) <= 254),
  -- NOTE: service values are defined in config/site.ts (serviceNames) and validated there.
  -- Deliberately NOT a CHECK constraint: the manager's brief is that services are swapped
  -- per business ("Adjust per Company's product offerings"), and a hard-coded constraint
  -- here would mean every content change needs a migration.
  service text not null check (length(service) between 1 and 120),
  status text not null default 'new' check (status in ('new', 'contacted', 'quoted', 'won', 'lost'))
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

-- RLS is ON with ZERO POLICIES, and that is intentional.
--
-- The anon/public key therefore cannot read or write this table at all. Inserts happen
-- only through /api/leads using SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS and never
-- reaches the browser.
--
-- DO NOT add a permissive policy such as `for select using (true)`. This table holds
-- customer names, phone numbers and street addresses; one careless policy makes every
-- one of them world-readable.
alter table public.leads enable row level security;
