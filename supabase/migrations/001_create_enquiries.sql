create extension if not exists pgcrypto;

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  phone text,
  country text not null,
  city text not null,
  preferred_contact_method text not null check (preferred_contact_method in ('Email', 'Phone', 'WhatsApp')),
  preferred_test_drive_date date,
  exterior_finish text not null,
  wheel_theme text not null,
  transmission text not null,
  message text,
  marketing_consent boolean not null default false,
  privacy_consent boolean not null,
  status text not null default 'new',
  user_agent text,
  referrer text
);

create index if not exists enquiries_created_at_idx on public.enquiries (created_at desc);
create index if not exists enquiries_status_idx on public.enquiries (status);

alter table public.enquiries enable row level security;

drop policy if exists "Service role can manage enquiries" on public.enquiries;
create policy "Service role can manage enquiries"
on public.enquiries
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
