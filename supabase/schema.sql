-- ============================================================
-- Vesta — schéma de base (Supabase / Postgres)
-- À exécuter dans Supabase : Dashboard > SQL Editor > New query > coller > Run.
-- Idempotent : réexécutable sans casse.
-- ============================================================

-- ---------- Tables ----------

-- Une agence = un workspace. La formule (etincelle/flamme/brasier) est
-- résolue côté code depuis son id ; la base ne stocke jamais de montant.
create table if not exists public.agences (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  formule_id  text not null default 'etincelle',
  cree_le     timestamptz not null default now()
);

-- Profil applicatif, lié 1-1 à l'utilisateur d'authentification Supabase.
-- role : 'client' (agence) ou 'vesta' (studio, admin).
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  prenom     text,
  role       text not null default 'client' check (role in ('client','vesta')),
  agence_id  uuid references public.agences(id) on delete set null,
  cree_le    timestamptz not null default now()
);

-- Invitations. 'fondateur' : créée par Vesta (email + formule), le client
-- nomme son agence à l'inscription. 'membre' : créée par un fondateur pour
-- rattacher un collègue à son agence. Jeton à usage unique.
create table if not exists public.invitations (
  jeton       uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('fondateur','membre')),
  email       text,
  formule_id  text,
  agence_id   uuid references public.agences(id) on delete cascade,
  cree_le     timestamptz not null default now(),
  utilise_le  timestamptz
);

-- Demandes (jobs). Forme alignée sur le contrat pipeline (PIPELINE.md).
-- Les photos/plans/livrables stockent des CHEMINS de storage (pas des URLs) :
-- les URLs signées sont générées à la lecture, côté serveur.
create table if not exists public.jobs (
  id             uuid primary key default gen_random_uuid(),
  cree_le        timestamptz not null default now(),
  agence_id      uuid not null references public.agences(id) on delete cascade,
  client_email   text not null,
  client_prenom  text,
  property_title text not null,
  property_city  text not null,
  photos         jsonb not null default '[]',   -- [{ room, path }]
  floorplan_path text,
  agencement     text not null default '',
  options        jsonb not null default '{}',    -- { formats, staging, exclude }
  status         text not null default 'recu'
                 check (status in ('recu','analyse','en_production','controle_qualite','livre','attention_requise')),
  status_message text,
  deliverables   jsonb not null default '[]',    -- [{ kind, path, room? }]
  reponses       jsonb not null default '[]'     -- [{ texte, photos:[{room,path}], le }]
);

create index if not exists jobs_agence_idx on public.jobs (agence_id, cree_le desc);

-- ---------- Droits d'accès des rôles d'API ----------
-- Nécessaire car les tables sont créées via une connexion externe : on
-- accorde explicitement les privilèges aux rôles PostgREST. Les lignes
-- restent protégées par le RLS ci-dessous ; service_role le contourne.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

-- ---------- Fonctions d'aide (sécurité) ----------

create or replace function public.est_vesta()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'vesta');
$$;

create or replace function public.mon_agence()
returns uuid language sql stable security definer set search_path = public as $$
  select agence_id from public.profiles where id = auth.uid();
$$;

-- ---------- Row Level Security ----------

alter table public.agences     enable row level security;
alter table public.profiles    enable row level security;
alter table public.invitations enable row level security;
alter table public.jobs        enable row level security;

-- Agences : les membres voient leur agence ; Vesta voit tout.
drop policy if exists agences_select on public.agences;
create policy agences_select on public.agences for select
  using (est_vesta() or id = mon_agence());

-- Profils : chacun voit son profil et ceux de son agence ; Vesta voit tout.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (est_vesta() or id = auth.uid() or agence_id = mon_agence());

-- Chacun peut mettre à jour son propre profil (ex. prénom).
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- Demandes : lecture/écriture limitées à l'agence du membre ; Vesta partout.
drop policy if exists jobs_select on public.jobs;
create policy jobs_select on public.jobs for select
  using (est_vesta() or agence_id = mon_agence());

drop policy if exists jobs_insert on public.jobs;
create policy jobs_insert on public.jobs for insert
  with check (est_vesta() or agence_id = mon_agence());

drop policy if exists jobs_update on public.jobs;
create policy jobs_update on public.jobs for update
  using (est_vesta() or agence_id = mon_agence())
  with check (est_vesta() or agence_id = mon_agence());

-- Invitations : gérées côté serveur (clé secrète, qui contourne le RLS).
-- Aucune policy publique : par défaut, personne d'autre n'y accède.

-- ---------- Stockage ----------

-- Buckets privés. Accès en lecture par URLs signées (générées serveur).
insert into storage.buckets (id, name, public)
  values ('photos','photos', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public)
  values ('deliverables','deliverables', false)
  on conflict (id) do nothing;

-- Un membre dépose/lit les photos dans le dossier de SON agence :
--   photos/{agence_id}/...  (le 1er segment du chemin = agence_id).
drop policy if exists photos_insert on storage.objects;
create policy photos_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'photos'
    and (est_vesta() or (storage.foldername(name))[1] = mon_agence()::text)
  );

drop policy if exists photos_select on storage.objects;
create policy photos_select on storage.objects for select to authenticated
  using (
    bucket_id = 'photos'
    and (est_vesta() or (storage.foldername(name))[1] = mon_agence()::text)
  );

-- Livrables : déposés par Vesta / le pipeline (clé secrète). Lecture par
-- l'agence propriétaire (dossier deliverables/{agence_id}/...).
drop policy if exists deliverables_select on storage.objects;
create policy deliverables_select on storage.objects for select to authenticated
  using (
    bucket_id = 'deliverables'
    and (est_vesta() or (storage.foldername(name))[1] = mon_agence()::text)
  );
