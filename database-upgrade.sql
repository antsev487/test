-- Coach Toolkit V2 upgrade for an existing V1 Supabase database
create extension if not exists "uuid-ossp";
alter table players add column if not exists positions text[] default '{}';
update players set positions=array[position] where (positions is null or array_length(positions,1) is null) and position is not null and position<>'';
create table if not exists match_day_lineups(id uuid primary key default uuid_generate_v4(),user_id uuid not null references auth.users(id) on delete cascade,opponent text not null,match_date date,formation text not null,lineup jsonb not null default '{}'::jsonb,bench jsonb not null default '[]'::jsonb,notes text,created_at timestamptz default now());
alter table match_day_lineups enable row level security;
drop policy if exists "lineups select own" on match_day_lineups;drop policy if exists "lineups insert own" on match_day_lineups;drop policy if exists "lineups update own" on match_day_lineups;drop policy if exists "lineups delete own" on match_day_lineups;
create policy "lineups select own" on match_day_lineups for select using(auth.uid()=user_id);
create policy "lineups insert own" on match_day_lineups for insert with check(auth.uid()=user_id);
create policy "lineups update own" on match_day_lineups for update using(auth.uid()=user_id);
create policy "lineups delete own" on match_day_lineups for delete using(auth.uid()=user_id);
