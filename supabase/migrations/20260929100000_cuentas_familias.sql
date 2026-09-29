-- Fase 1: cuentas, familias, participantes y ficha de socio.
-- Regla general: cada familia solo ve y toca sus propios datos; los admins ven todo.
-- DNI e IBAN llegan ya cifrados desde el servidor de la web (src/lib/crypto.ts).

create type public.account_type as enum ('familia', 'voluntari', 'admin');

-- ---------------------------------------------------------------------------
-- Utilidades
-- ---------------------------------------------------------------------------

create function public.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Perfiles: uno por cuenta de Supabase Auth
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  account_type public.account_type not null default 'familia',
  full_name text not null check (char_length(full_name) between 2 and 120),
  phone text not null check (char_length(phone) between 9 and 20),
  locale text not null default 'ca' check (locale in ('ca', 'es')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil al registrarse. Nunca se puede pedir ser admin desde el registro.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, account_type, full_name, phone, locale)
  values (
    new.id,
    case when meta ->> 'account_type' = 'voluntari' then 'voluntari'::public.account_type
         else 'familia'::public.account_type end,
    coalesce(meta ->> 'full_name', ''),
    coalesce(meta ->> 'phone', ''),
    case when meta ->> 'locale' = 'es' then 'es' else 'ca' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and account_type = 'admin'
  );
$$;

create function public.is_family() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and account_type = 'familia'
  );
$$;

-- ---------------------------------------------------------------------------
-- Ficha de socio (una por familia)
-- ---------------------------------------------------------------------------

create table public.memberships (
  family_id uuid primary key references public.profiles (id) on delete cascade,
  dni_encrypted text not null,
  address text not null check (char_length(address) between 3 and 200),
  postal_code text not null check (postal_code ~ '^[0-9]{5}$'),
  city text not null check (char_length(city) between 2 and 100),
  bank_name text not null check (char_length(bank_name) between 2 and 100),
  iban_encrypted text not null,
  iban_last4 text not null check (iban_last4 ~ '^[0-9]{4}$'),
  sepa_accepted_at timestamptz not null,
  sepa_reference text not null unique
    default 'FAMIC-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)),
  -- pendent: enviada por la familia; actiu: la asociación la ha dado de alta; baixa: ya no es socia.
  status text not null default 'pendent' check (status in ('pendent', 'actiu', 'baixa')),
  member_since date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger memberships_updated_at before update on public.memberships
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Participantes: las personas de la familia que van a las actividades
-- ---------------------------------------------------------------------------

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 120),
  dni_encrypted text not null,
  birth_date date not null check (birth_date > date '1900-01-01'),
  relationship text not null check (relationship in ('familiar', 'alumne', 'pacient', 'amic')),
  disability_pct smallint check (disability_pct between 0 and 100),
  has_dependency boolean not null default false,
  dependency_grade smallint check (dependency_grade between 1 and 3),
  allergies text check (char_length(allergies) <= 1000),
  medical_notes text check (char_length(medical_notes) <= 2000),
  guardian_authorized_at timestamptz not null,
  health_consent_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (has_dependency = (dependency_grade is not null))
);

create index participants_family_id_idx on public.participants (family_id);

create trigger participants_updated_at before update on public.participants
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Permisos. Nada es accesible sin sesión, y cada rol solo toca las columnas previstas.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.participants enable row level security;

revoke all on table public.profiles, public.memberships, public.participants from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, phone, locale) on table public.profiles to authenticated;

grant select, delete on table public.memberships to authenticated;
grant insert (family_id, dni_encrypted, address, postal_code, city, bank_name, iban_encrypted, iban_last4, sepa_accepted_at)
  on table public.memberships to authenticated;
grant update (dni_encrypted, address, postal_code, city, bank_name, iban_encrypted, iban_last4, sepa_accepted_at)
  on table public.memberships to authenticated;

grant select, delete on table public.participants to authenticated;
grant insert (first_name, last_name, dni_encrypted, birth_date, relationship, disability_pct, has_dependency,
  dependency_grade, allergies, medical_notes, guardian_authorized_at, health_consent_at)
  on table public.participants to authenticated;
grant update (first_name, last_name, dni_encrypted, birth_date, relationship, disability_pct, has_dependency,
  dependency_grade, allergies, medical_notes, guardian_authorized_at, health_consent_at)
  on table public.participants to authenticated;

revoke execute on function public.is_admin(), public.is_family(), public.handle_new_user() from public, anon;
grant execute on function public.is_admin(), public.is_family() to authenticated;

-- Perfiles
create policy "Cada uno ve su perfil; los admins ven todos" on public.profiles
  for select to authenticated using (id = (select auth.uid()) or (select public.is_admin()));
create policy "Cada uno edita su perfil" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Ficha de socio
create policy "La familia ve su ficha; los admins ven todas" on public.memberships
  for select to authenticated using (family_id = (select auth.uid()) or (select public.is_admin()));
create policy "Solo una familia puede darse de alta como socia" on public.memberships
  for insert to authenticated with check (family_id = (select auth.uid()) and (select public.is_family()));
create policy "La familia edita su ficha" on public.memberships
  for update to authenticated using (family_id = (select auth.uid())) with check (family_id = (select auth.uid()));
create policy "Solo los admins borran fichas" on public.memberships
  for delete to authenticated using ((select public.is_admin()));

-- Participantes
create policy "La familia ve sus participantes; los admins ven todos" on public.participants
  for select to authenticated using (family_id = (select auth.uid()) or (select public.is_admin()));
create policy "Solo una familia añade participantes" on public.participants
  for insert to authenticated with check (family_id = (select auth.uid()) and (select public.is_family()));
create policy "La familia edita sus participantes" on public.participants
  for update to authenticated using (family_id = (select auth.uid())) with check (family_id = (select auth.uid()));
create policy "La familia borra sus participantes" on public.participants
  for delete to authenticated using (family_id = (select auth.uid()));
