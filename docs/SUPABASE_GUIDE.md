# SimuPay Pro — Supabase Configuration Guide

This guide provides step-by-step instructions to properly configure your Supabase backend to match the production capabilities of SimuPay Pro. Following these steps will resolve all database sync, RLS, and missing profile anomalies.

---

## 1. Automatic Profile Generation on Signup (Fixes "profiles 404" Errors)

**The Issue:**
When a new user registers through Supabase Auth, they are added to `auth.users`, but their corresponding record in `public.profiles` is missing, causing `404 /rest/v1/profiles` errors on the client interface.

**The Solution:**
Run the following PostgreSQL trigger script in your **Supabase Dashboard SQL Editor** to automate profile creation.

```sql
-- 1. Create a function that handles new signup insertions
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, wallet_balance, license_type, license_active)
  values (
    new.id,
    new.email,
    'user',            -- Default role
    50000.00,          -- Initial sandbox balance placeholder (₦50,000)
    'Standard',        -- Default license type
    false              -- License not active until activated
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 2. Bind the trigger to auth.users insertions
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

---

## 2. Setting Up the AI Operations Logs Table (`beauty_breakout_logs`)

To leverage the **Forex & Commodities Operations Suite** with state preservation, you must create the logs table in the `public` schema.

```sql
-- 1. Create table
create table if not exists public.beauty_breakout_logs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users(id) on delete cascade,
  campaign_traffic text,
  checkout_success_rate text,
  api_latency text,
  analysis_text text
);

-- 2. Enable Row Level Security (RLS)
alter table public.beauty_breakout_logs enable row level security;

-- 3. Safely drop existing policies to prevent "policy already exists" errors
drop policy if exists "Users can read their own logs" on public.beauty_breakout_logs;
drop policy if exists "Users can insert their own logs" on public.beauty_breakout_logs;

-- 4. Create RLS policies
create policy "Users can read their own logs"
  on public.beauty_breakout_logs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own logs"
  on public.beauty_breakout_logs
  for insert
  to authenticated
  with check (auth.uid() = user_id);
```

---

## 3. Explicit Data API Grants (Fixes Permissions Issues)

Ensure the Supabase PostgREST Data API has appropriate grants for authenticated user roles to query and save records.

```sql
-- Explicitly grant table permissions to the authenticated role
grant select, insert, update, delete on public.beauty_breakout_logs to authenticated;
grant select, insert, update on public.profiles to authenticated;
```

---

## 4. Resolving Transaction & Deployment Issues

### "Cannot execute in a read-only transaction"
* **Cause:** Running DDL (schema-changing) operations inside a read-only session, or when using a tool/database pooler link configured for read-only replica queries.
* **Fix:** Ensure you run these SQL operations in the **Supabase Dashboard SQL Editor** directly, as it runs with superuser write privileges. Avoid using connection strings on port `6543` (transaction pooler) for raw migrations if it is restricted to transaction-mode; prefer the direct port `5432` or the built-in UI Editor.

### "Policy already exists"
* **Cause:** Running `CREATE POLICY` statements on a policy name that has already been bound to the table.
* **Fix:** Always prepend your policy creation statements with `DROP POLICY IF EXISTS "policy_name" ON schema.table;` as shown in Section 2 above.
