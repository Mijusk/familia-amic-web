-- Fase 5: contenido.
-- Noticias y recursos (guías) que se editan desde el panel, fotos de actividades, mensajes de contacto,
-- solicitudes de voluntariado y el consentimiento para publicar fotos de cada participante.

-- ---------------------------------------------------------------------------
-- Noticias
-- ---------------------------------------------------------------------------

create table public.news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  -- Se publica en el idioma en que se escribe, sin traducir.
  lang text not null default 'ca' check (lang in ('ca', 'es')),
  title text not null check (char_length(title) between 2 and 160),
  summary text not null check (char_length(summary) between 2 and 400),
  body text not null default '' check (char_length(body) <= 20000),
  image_url text check (char_length(image_url) <= 500),
  -- Vínculo opcional con una actividad (p. ej. la crónica de una excursión).
  activity_id uuid references public.activities (id) on delete set null,
  published_on date not null default public.today_local(),
  status text not null default 'esborrany' check (status in ('esborrany', 'publicada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index news_published_idx on public.news (status, published_on desc);

create trigger news_updated_at before update on public.news
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Recursos: guías prácticas (temas legales, educación, medicina)
-- ---------------------------------------------------------------------------

create table public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  lang text not null default 'ca' check (lang in ('ca', 'es')),
  category text not null check (category in ('legals', 'educacio', 'salut')),
  title text not null check (char_length(title) between 2 and 160),
  summary text not null default '' check (char_length(summary) <= 400),
  body text not null default '' check (char_length(body) <= 30000),
  -- Enlace a la fuente oficial (Generalitat, Seguridad Social…).
  external_url text check (char_length(external_url) <= 500),
  position integer not null default 0,
  status text not null default 'esborrany' check (status in ('esborrany', 'publicada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resources_category_idx on public.resources (status, category, position);

create trigger resources_updated_at before update on public.resources
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Fotos de actividades (ficheros en Storage, bucket "fotos")
-- ---------------------------------------------------------------------------

create table public.activity_photos (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete cascade,
  -- Ruta dentro del bucket "fotos".
  path text not null unique check (char_length(path) between 3 and 300),
  caption text not null default '' check (char_length(caption) <= 200),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index activity_photos_activity_idx on public.activity_photos (activity_id, position);

-- El bucket y sus permisos solo se crean donde existe Storage (en Supabase siempre; en local, si está activado).
do $$
begin
  if to_regclass('storage.buckets') is null then
    raise notice 'Storage no disponible: se omite el bucket de fotos';
    return;
  end if;
  insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('fotos', 'fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
  on conflict (id) do nothing;
  -- Cualquiera puede ver las fotos (el bucket es público); solo los admins las suben o borran.
  create policy "Solo admins suben fotos" on storage.objects for insert to authenticated
    with check (bucket_id = 'fotos' and (select public.is_admin()));
  create policy "Solo admins cambian fotos" on storage.objects for update to authenticated
    using (bucket_id = 'fotos' and (select public.is_admin()));
  create policy "Solo admins borran fotos" on storage.objects for delete to authenticated
    using (bucket_id = 'fotos' and (select public.is_admin()));
end;
$$;

-- ---------------------------------------------------------------------------
-- Consentimiento de imagen: si se pueden publicar fotos en las que salga el participante
-- ---------------------------------------------------------------------------

alter table public.participants add column image_consent boolean not null default false;
grant insert (image_consent), update (image_consent) on table public.participants to authenticated;

-- ---------------------------------------------------------------------------
-- Mensajes del formulario de contacto
-- ---------------------------------------------------------------------------

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) between 5 and 200),
  phone text not null default '' check (char_length(phone) <= 30),
  message text not null check (char_length(message) between 5 and 5000),
  locale text not null default 'ca' check (locale in ('ca', 'es')),
  handled_at timestamptz,
  created_at timestamptz not null default now()
);

create index contact_messages_created_idx on public.contact_messages (created_at desc);

-- ---------------------------------------------------------------------------
-- Voluntariado: la solicitud de una cuenta de voluntario
-- ---------------------------------------------------------------------------

create table public.volunteer_applications (
  profile_id uuid primary key default auth.uid() references public.profiles (id) on delete cascade,
  areas text[] not null default '{}'
    check (areas <@ array['activitats', 'esports', 'casals', 'tallers', 'comunicacio', 'administracio', 'altres']),
  availability text not null check (char_length(availability) between 2 and 500),
  experience text not null default '' check (char_length(experience) <= 2000),
  motivation text not null default '' check (char_length(motivation) <= 2000),
  -- nova: acabada de enviar; contactada: la asociación ha hablado con la persona; activa: colabora; arxivada.
  status text not null default 'nova' check (status in ('nova', 'contactada', 'activa', 'arxivada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger volunteer_applications_updated_at before update on public.volunteer_applications
  for each row execute function public.set_updated_at();

create function public.is_volunteer() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles where id = (select auth.uid()) and account_type = 'voluntari'
  );
$$;

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

alter table public.news enable row level security;
alter table public.resources enable row level security;
alter table public.activity_photos enable row level security;
alter table public.contact_messages enable row level security;
alter table public.volunteer_applications enable row level security;

revoke all on table public.news, public.resources, public.activity_photos, public.contact_messages,
  public.volunteer_applications from anon, authenticated;

-- Noticias, recursos y fotos: públicos cuando están publicados; solo los admins los gestionan.
grant select on table public.news, public.resources, public.activity_photos to anon, authenticated;
grant insert, update, delete on table public.news, public.resources, public.activity_photos to authenticated;

create policy "Noticias publicadas visibles para todos" on public.news for select to anon, authenticated
  using (status = 'publicada' or (select public.is_admin()));
create policy "Solo admins gestionan noticias" on public.news for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Recursos publicados visibles para todos" on public.resources for select to anon, authenticated
  using (status = 'publicada' or (select public.is_admin()));
create policy "Solo admins gestionan recursos" on public.resources for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Fotos de actividades publicadas visibles para todos" on public.activity_photos for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.activities a where a.id = activity_id and a.status in ('publicada', 'finalitzada'))
  );
create policy "Solo admins gestionan fotos" on public.activity_photos for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Contacto: cualquiera envía (desde el servidor de la web); solo los admins leen y marcan como atendido.
grant insert (name, email, phone, message, locale) on table public.contact_messages to anon, authenticated;
grant select, delete on table public.contact_messages to authenticated;
grant update (handled_at) on table public.contact_messages to authenticated;
create policy "Cualquiera escribe a la asociación" on public.contact_messages for insert to anon, authenticated
  with check (handled_at is null);
create policy "Solo admins leen los mensajes" on public.contact_messages for select to authenticated
  using ((select public.is_admin()));
create policy "Solo admins marcan los mensajes" on public.contact_messages for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Solo admins borran los mensajes" on public.contact_messages for delete to authenticated
  using ((select public.is_admin()));

-- Voluntariado: cada voluntario ve y edita su solicitud (sin tocar el estado); los admins, todas.
grant select on table public.volunteer_applications to authenticated;
grant insert (areas, availability, experience, motivation) on table public.volunteer_applications to authenticated;
grant update (areas, availability, experience, motivation, status) on table public.volunteer_applications to authenticated;
create policy "El voluntario ve su solicitud; los admins todas" on public.volunteer_applications for select to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()));
create policy "Solo una cuenta de voluntario envía solicitud" on public.volunteer_applications for insert to authenticated
  with check (profile_id = (select auth.uid()) and (select public.is_volunteer()) and status = 'nova');
create policy "El voluntario edita su solicitud; los admins cambian el estado" on public.volunteer_applications
  for update to authenticated
  using (profile_id = (select auth.uid()) or (select public.is_admin()))
  with check (profile_id = (select auth.uid()) or (select public.is_admin()));

-- El voluntario no puede cambiar su propio estado: solo un admin.
create function public.protect_volunteer_status() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status is distinct from old.status and not public.is_admin() then
    raise exception 'only_admin_status' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger volunteer_applications_status before update on public.volunteer_applications
  for each row execute function public.protect_volunteer_status();

revoke execute on function public.is_volunteer(), public.protect_volunteer_status() from public, anon;
grant execute on function public.is_volunteer() to authenticated;
