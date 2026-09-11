create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  address text not null,
  service text not null check (service in ('Home / Garage Epoxy', 'Commercial / Factory Epoxy', 'Other Epoxy Flooring')),
  status text not null default 'new'
);

alter table public.leads enable row level security;
