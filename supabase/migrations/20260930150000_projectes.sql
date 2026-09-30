-- Projectes: páginas informativas (TOTAMIC, casal d'estiu…) que se editan desde el panel, con imagen de portada y
-- galería de fotos. Las imágenes van al mismo bucket "fotos" (en la carpeta projectes/ o imatges/ para las portadas).

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  -- Se publica en el idioma en que se escribe, sin traducir (como las noticias).
  lang text not null default 'ca' check (lang in ('ca', 'es')),
  title text not null check (char_length(title) between 2 and 120),
  subtitle text not null default '' check (char_length(subtitle) <= 200),
  body text not null default '' check (char_length(body) <= 20000),
  image_url text check (char_length(image_url) <= 500),
  position integer not null default 0,
  status text not null default 'esborrany' check (status in ('esborrany', 'publicada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_position_idx on public.projects (status, position);

create trigger projects_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

create table public.project_photos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  -- Ruta dentro del bucket "fotos".
  path text not null unique check (char_length(path) between 3 and 300),
  caption text not null default '' check (char_length(caption) <= 200),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index project_photos_project_idx on public.project_photos (project_id, position);

alter table public.projects enable row level security;
alter table public.project_photos enable row level security;

revoke all on table public.projects, public.project_photos from anon, authenticated;
grant select on table public.projects, public.project_photos to anon, authenticated;
grant insert, update, delete on table public.projects, public.project_photos to authenticated;

create policy "Proyectos publicados visibles para todos" on public.projects for select to anon, authenticated
  using (status = 'publicada' or (select public.is_admin()));
create policy "Solo admins gestionan proyectos" on public.projects for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Fotos de proyectos publicados visibles para todos" on public.project_photos for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.projects p where p.id = project_id and p.status = 'publicada')
  );
create policy "Solo admins gestionan fotos de proyectos" on public.project_photos for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Para borrar ficheros de Storage hace falta poder "verlos" por la API: sin esta regla, eliminar una foto dejaba el
-- fichero en el bucket. Las fotos siguen siendo públicas por su dirección (el bucket es público).
do $$
begin
  if to_regclass('storage.objects') is null then
    return;
  end if;
  create policy "Solo admins listan fotos" on storage.objects for select to authenticated
    using (bucket_id = 'fotos' and (select public.is_admin()));
end;
$$;
