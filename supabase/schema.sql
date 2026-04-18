-- MazarBooking - Supabase schema
-- Apply this in Supabase SQL Editor.

-- BOOKINGS
create table if not exists public.bookings (
  id text primary key,
  name text not null,
  phone text not null,
  check_in date not null,
  check_out date not null,
  apartment_id text null,
  studio text null,
  status text not null default 'رد جديد',
  payment_info text null,
  total_amount integer null,
  number_of_days integer null,
  nationality text null,
  id_number text null,
  commission integer null,
  broker_name text null,
  notes text null,
  timestamp timestamptz not null default now()
);

create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_check_in_idx on public.bookings(check_in);

-- UNITS
create table if not exists public.units (
  id text primary key,
  branch integer null,
  type text null,
  title jsonb null,
  status text null,
  housekeeping text null,
  next_booking text null,
  description jsonb null,
  images jsonb null,
  video text null,
  features jsonb null,
  original_price text null,
  price text null,
  updated_at timestamptz not null default now()
);

-- ADMINS (note: passwords are currently plaintext to match existing app behavior)
create table if not exists public.admins (
  id text primary key,
  username text not null unique,
  password text not null,
  name text not null,
  role text not null
);

-- TRANSLATIONS (single row with id=1)
create table if not exists public.translations (
  id integer primary key,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.translations (id, data)
values (1, '{}'::jsonb)
on conflict (id) do nothing;

-- STORAGE
-- Create a public bucket named "uploads" from Supabase Storage UI,
-- or run the following (requires appropriate privileges):
-- insert into storage.buckets (id, name, public)
-- values ('uploads', 'uploads', true)
-- on conflict (id) do update set public = true;

