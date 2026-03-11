-- IT Contract Tracker – Supabase Schema
-- Run this in your Supabase SQL Editor

create table if not exists contracts (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  vendor        text not null,
  agency        text not null,
  value         numeric default 0,
  category      text not null check (category in ('Contracts','Financial Results','M&A','New Offerings','Partnerships')),
  status        text not null default 'active' check (status in ('active','expired','pending')),
  start_date    date,
  end_date      date,
  description   text,
  summary       text,
  implications  text,
  extracted_from text,
  year          integer not null,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Indexes
create index if not exists contracts_year_idx on contracts(year);
create index if not exists contracts_category_idx on contracts(category);
create index if not exists contracts_vendor_idx on contracts(vendor);
create index if not exists contracts_status_idx on contracts(status);

-- Row Level Security (optional)
alter table contracts enable row level security;

-- Allow service role full access (used by backend)
create policy "service_role_all" on contracts
  for all using (true) with check (true);
