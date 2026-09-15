create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text,
  phone text not null,
  address text not null,
  service text not null check (service in ('Home / Garage Epoxy', 'Commercial / Factory Epoxy', 'Other Epoxy Flooring')),
  status text not null default 'pending' check (status in ('pending', 'active', 'responded', 'closed'))
);

-- Safe upgrade for the first version of this POC.
alter table public.leads add column if not exists email text;
alter table public.leads drop constraint if exists leads_status_check;
update public.leads set status = 'pending' where status = 'new';
alter table public.leads alter column status set default 'pending';
alter table public.leads add constraint leads_status_check check (status in ('pending', 'active', 'responded', 'closed'));
create index if not exists leads_created_at_desc_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- The application uses a server-only secret key for both public lead inserts
-- and admin access, so no public table policies are required.
revoke all on table public.leads from anon, authenticated;
