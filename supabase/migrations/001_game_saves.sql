-- Volley Manager — migrasi 001: cloud save per pemain.
-- Jalankan di Supabase: SQL Editor > New query > tempel > Run (aman diulang).
-- Auth: Authentication > Providers > Email aktif. Untuk uji cepat, matikan "Confirm email".

create table if not exists public.game_saves (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,            -- seluruh state game (objek S di js/main.js)
  versi      int   not null default 2,  -- S.versi (skema simpanan)
  klub       text,                      -- ringkasan untuk daftar/leaderboard nanti
  musim      int,
  updated_at timestamptz not null default now()
);

alter table public.game_saves enable row level security;

drop policy if exists "save_select_own" on public.game_saves;
drop policy if exists "save_insert_own" on public.game_saves;
drop policy if exists "save_update_own" on public.game_saves;
drop policy if exists "save_delete_own" on public.game_saves;
create policy "save_select_own" on public.game_saves for select using (auth.uid() = user_id);
create policy "save_insert_own" on public.game_saves for insert with check (auth.uid() = user_id);
create policy "save_update_own" on public.game_saves for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "save_delete_own" on public.game_saves for delete using (auth.uid() = user_id);

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists game_saves_updated on public.game_saves;
create trigger game_saves_updated before update on public.game_saves
  for each row execute function public.set_updated_at();

-- Opsional (nanti): leaderboard publik tanpa membuka data save.
-- create view public.leaderboard as
--   select klub, musim, updated_at from public.game_saves where klub is not null;
-- grant select on public.leaderboard to anon, authenticated;
