-- Inicio de la web: fotos que van pasando (editables desde el panel), noticias y actividades destacadas entre dos
-- fechas, y galería de fotos también en las noticias.

-- ---------------------------------------------------------------------------
-- Fotos del inicio
-- ---------------------------------------------------------------------------

create table public.home_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null check (char_length(image_url) between 10 and 500),
  caption text not null default '' check (char_length(caption) <= 140),
  -- Enlace opcional: una página de la web (/ca/activitats/…) o una dirección https.
  link_url text check (char_length(link_url) <= 500),
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index home_slides_position_idx on public.home_slides (active, position);

alter table public.home_slides enable row level security;
revoke all on table public.home_slides from anon, authenticated;
grant select on table public.home_slides to anon, authenticated;
grant insert, update, delete on table public.home_slides to authenticated;

create policy "Fotos del inicio activas visibles para todos" on public.home_slides for select to anon, authenticated
  using (active or (select public.is_admin()));
create policy "Solo admins gestionan las fotos del inicio" on public.home_slides for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- ---------------------------------------------------------------------------
-- Destacados: una noticia o una actividad sale arriba del inicio entre dos fechas (ambas incluidas)
-- ---------------------------------------------------------------------------

alter table public.news
  add column featured_from date,
  add column featured_until date,
  add constraint news_featured_dates check (
    (featured_from is null and featured_until is null)
    or (featured_from is not null and featured_until is not null and featured_until >= featured_from)
  );

alter table public.activities
  add column featured_from date,
  add column featured_until date,
  add constraint activities_featured_dates check (
    (featured_from is null and featured_until is null)
    or (featured_from is not null and featured_until is not null and featured_until >= featured_from)
  );

-- ---------------------------------------------------------------------------
-- Galería de fotos de las noticias (ficheros en el bucket "fotos", carpeta noticies/)
-- ---------------------------------------------------------------------------

create table public.news_photos (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.news (id) on delete cascade,
  path text not null unique check (char_length(path) between 3 and 300),
  caption text not null default '' check (char_length(caption) <= 200),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index news_photos_news_idx on public.news_photos (news_id, position);

alter table public.news_photos enable row level security;
revoke all on table public.news_photos from anon, authenticated;
grant select on table public.news_photos to anon, authenticated;
grant insert, update, delete on table public.news_photos to authenticated;

create policy "Fotos de noticias publicadas visibles para todos" on public.news_photos for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.news n where n.id = news_id and n.status = 'publicada')
  );
create policy "Solo admins gestionan fotos de noticias" on public.news_photos for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
