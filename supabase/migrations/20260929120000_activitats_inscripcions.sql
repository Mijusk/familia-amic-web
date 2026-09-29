-- Fase 2: actividades e inscripciones.
-- Las familias no escriben directamente en inscripciones: lo hacen con las funciones enroll() y unenroll(),
-- que comprueban socio o prueba, aforo y cola dentro de una misma transacción.
-- Fechas en hora de Barcelona.

create function public.today_local() returns date
language sql stable set search_path = '' as $$
  select (now() at time zone 'Europe/Madrid')::date;
$$;

create function public.month_end(d date) returns date
language sql immutable set search_path = '' as $$
  select (date_trunc('month', d) + interval '1 month - 1 day')::date;
$$;

-- ---------------------------------------------------------------------------
-- Categorías
-- ---------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,40}$'),
  name_ca text not null check (char_length(name_ca) between 2 and 60),
  name_es text not null check (char_length(name_es) between 2 and 60),
  sort_order smallint not null default 0
);

insert into public.categories (slug, name_ca, name_es, sort_order) values
  ('esportives', 'Esportives', 'Deportivas', 1),
  ('socials', 'Socials', 'Sociales', 2),
  ('musica', 'Música', 'Música', 3),
  ('tallers', 'Tallers de conscienciació', 'Talleres de concienciación', 4);

-- ---------------------------------------------------------------------------
-- Actividades: semanales (recurrent) o eventos puntuales (puntual)
-- ---------------------------------------------------------------------------

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,80}$'),
  -- Se publica en el idioma en que se escribe, sin traducir.
  lang text not null default 'ca' check (lang in ('ca', 'es')),
  title text not null check (char_length(title) between 2 and 120),
  summary text not null check (char_length(summary) between 2 and 300),
  description text not null default '' check (char_length(description) <= 5000),
  image_url text,
  category_id uuid references public.categories (id) on delete set null,
  kind text not null check (kind in ('recurrent', 'puntual')),
  -- Recurrentes: día de la semana (1 = lunes … 7 = domingo) y horario. Puntuales: fecha del evento en starts_on.
  weekday smallint check (weekday between 1 and 7),
  start_time time,
  end_time time,
  starts_on date not null,
  ends_on date,
  location text not null default '' check (char_length(location) <= 200),
  -- Vacío = sin límite de plazas.
  capacity integer check (capacity > 0),
  -- En céntimos: al mes para las recurrentes, por persona para las puntuales. Vacío = gratis.
  price_cents integer check (price_cents >= 0),
  -- rebut: va al recibo mensual domiciliado; transferencia: Bizum o transferencia con el nombre como concepto.
  payment_method text not null default 'rebut' check (payment_method in ('rebut', 'transferencia', 'gratuit')),
  payment_notes text not null default '' check (char_length(payment_notes) <= 500),
  enrollment_open boolean not null default true,
  status text not null default 'esborrany' check (status in ('esborrany', 'publicada', 'cancellada', 'finalitzada')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on is null or ends_on >= starts_on),
  check (kind = 'puntual' or (weekday is not null and start_time is not null and end_time is not null and end_time > start_time))
);

create index activities_status_idx on public.activities (status, starts_on);

create trigger activities_updated_at before update on public.activities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Inscripciones: un participante en una actividad
-- ---------------------------------------------------------------------------

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities (id) on delete restrict,
  participant_id uuid not null references public.participants (id) on delete restrict,
  family_id uuid not null references public.profiles (id) on delete cascade,
  -- confirmada: tiene plaza; cua: lista de espera (un admin decide quién pasa); baixa: ya no va.
  status text not null check (status in ('confirmada', 'cua', 'baixa')),
  -- Sesión de prueba sin ser socio: una por participante, en la fecha trial_date.
  is_trial boolean not null default false,
  trial_date date,
  -- Recurrentes: true = se renueva cada mes; false = termina a final de mes (ends_on).
  auto_renew boolean not null default false,
  starts_on date not null default public.today_local(),
  -- Último día que cuenta. En una baja de una recurrente, el final de ese mes.
  ends_on date,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_trial = (trial_date is not null))
);

-- Un participante no puede estar dos veces a la vez en la misma actividad.
create unique index enrollments_one_active_idx on public.enrollments (activity_id, participant_id)
  where status <> 'baixa';
create index enrollments_family_idx on public.enrollments (family_id);
create index enrollments_activity_idx on public.enrollments (activity_id, status, created_at);

create trigger enrollments_updated_at before update on public.enrollments
  for each row execute function public.set_updated_at();

-- Plaza ocupada = confirmada y vigente hoy. Las pruebas no ocupan plaza fija.
create function public.is_occupying(e public.enrollments) returns boolean
language sql stable set search_path = '' as $$
  select e.status = 'confirmada' and not e.is_trial and (e.ends_on is null or e.ends_on >= public.today_local());
$$;

-- ---------------------------------------------------------------------------
-- Consultas públicas: plazas libres y posición en la cola (sin exponer quién está inscrito)
-- ---------------------------------------------------------------------------

create function public.activity_spots()
returns table (activity_id uuid, occupied integer, queued integer)
language sql stable security definer set search_path = '' as $$
  select a.id,
    (count(*) filter (where public.is_occupying(e)))::integer,
    (count(*) filter (where e.status = 'cua'))::integer
  from public.activities a
  left join public.enrollments e on e.activity_id = a.id
  where a.status = 'publicada' or (select public.is_admin())
  group by a.id;
$$;

create function public.my_queue_positions()
returns table (enrollment_id uuid, queue_position integer)
language sql stable security definer set search_path = '' as $$
  select q.id, q.pos::integer from (
    select e.id, e.family_id,
      row_number() over (partition by e.activity_id order by e.created_at, e.id) as pos
    from public.enrollments e where e.status = 'cua'
  ) q
  where q.family_id = (select auth.uid());
$$;

-- ---------------------------------------------------------------------------
-- Apuntarse
-- ---------------------------------------------------------------------------

-- Devuelve una fila por participante con el resultado: confirmada, cua, prova, ja_inscrit,
-- cal_ser_soci, prova_usada, prova_completa.
create function public.enroll(
  p_activity_id uuid,
  p_participant_ids uuid[],
  p_auto_renew boolean default false,
  p_trial_date date default null
)
returns table (participant_id uuid, result text, enrollment_id uuid)
language plpgsql security definer set search_path = '' as $$
#variable_conflict use_column
declare
  v_family uuid := auth.uid();
  v_activity public.activities;
  v_today date := public.today_local();
  v_is_member boolean;
  v_free integer;
  v_pid uuid;
  v_id uuid;
begin
  if v_family is null or not public.is_family() then
    raise exception 'not_family' using errcode = '42501';
  end if;
  if coalesce(array_length(p_participant_ids, 1), 0) = 0 then
    raise exception 'no_participants' using errcode = '22023';
  end if;

  -- Bloquea la actividad: dos familias no pueden coger la última plaza a la vez.
  select * into v_activity from public.activities where id = p_activity_id for update;
  if not found or v_activity.status <> 'publicada' or not v_activity.enrollment_open then
    raise exception 'closed' using errcode = '22023';
  end if;
  if coalesce(v_activity.ends_on, v_activity.starts_on) < v_today
     and (v_activity.kind = 'puntual' or v_activity.ends_on is not null) then
    raise exception 'closed' using errcode = '22023';
  end if;

  if exists (
    select 1 from unnest(p_participant_ids) as p(id)
    where not exists (select 1 from public.participants x where x.id = p.id and x.family_id = v_family)
  ) then
    raise exception 'not_your_participant' using errcode = '42501';
  end if;

  -- Ficha de socio enviada (pendiente de validar) o activa.
  v_is_member := exists (
    select 1 from public.memberships m where m.family_id = v_family and m.status in ('pendent', 'actiu')
  );

  if not v_is_member and p_trial_date is not null then
    if p_trial_date < v_today or p_trial_date > v_today + 60
       or (v_activity.kind = 'recurrent' and extract(isodow from p_trial_date) <> v_activity.weekday)
       or (v_activity.kind = 'puntual' and p_trial_date <> v_activity.starts_on)
       or p_trial_date < v_activity.starts_on
       or (v_activity.ends_on is not null and p_trial_date > v_activity.ends_on) then
      raise exception 'bad_trial_date' using errcode = '22023';
    end if;
  end if;

  select coalesce(v_activity.capacity - count(*), 2147483647)::integer into v_free
  from public.enrollments e where e.activity_id = p_activity_id and public.is_occupying(e);

  foreach v_pid in array (select array_agg(distinct x) from unnest(p_participant_ids) as x) loop
    participant_id := v_pid;
    enrollment_id := null;

    if exists (select 1 from public.enrollments e
               where e.activity_id = p_activity_id and e.participant_id = v_pid and e.status <> 'baixa'
                 and (e.ends_on is null or e.ends_on >= v_today)) then
      result := 'ja_inscrit';
    elsif not v_is_member then
      if p_trial_date is null then
        result := 'cal_ser_soci';
      elsif exists (select 1 from public.enrollments e
                    where e.participant_id = v_pid and e.is_trial and e.status <> 'baixa') then
        result := 'prova_usada';
      elsif v_free <= 0 then
        result := 'prova_completa';
      else
        -- Libera una inscripción ya terminada que bloquearía el índice único.
        update public.enrollments e set status = 'baixa'
          where e.activity_id = p_activity_id and e.participant_id = v_pid and e.status <> 'baixa';
        insert into public.enrollments (activity_id, participant_id, family_id, status, is_trial, trial_date,
                                        starts_on, ends_on)
        values (p_activity_id, v_pid, v_family, 'confirmada', true, p_trial_date, p_trial_date, p_trial_date)
        returning id into v_id;
        result := 'prova';
        enrollment_id := v_id;
      end if;
    else
      update public.enrollments e set status = 'baixa'
        where e.activity_id = p_activity_id and e.participant_id = v_pid and e.status <> 'baixa';
      if v_free > 0 then
        insert into public.enrollments (activity_id, participant_id, family_id, status, auto_renew, starts_on, ends_on)
        values (
          p_activity_id, v_pid, v_family, 'confirmada',
          v_activity.kind = 'recurrent' and p_auto_renew,
          greatest(v_today, v_activity.starts_on),
          case
            when v_activity.kind = 'puntual' then coalesce(v_activity.ends_on, v_activity.starts_on)
            when p_auto_renew then v_activity.ends_on
            else least(public.month_end(greatest(v_today, v_activity.starts_on)), coalesce(v_activity.ends_on, 'infinity'::date))
          end
        )
        returning id into v_id;
        v_free := v_free - 1;
        result := 'confirmada';
      else
        insert into public.enrollments (activity_id, participant_id, family_id, status, auto_renew, starts_on)
        values (p_activity_id, v_pid, v_family, 'cua', v_activity.kind = 'recurrent' and p_auto_renew,
                greatest(v_today, v_activity.starts_on))
        returning id into v_id;
        result := 'cua';
      end if;
      enrollment_id := v_id;
    end if;
    return next;
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Darse de baja. En una recurrente confirmada la baja cuenta desde el mes siguiente:
-- se cobra hasta final de mes, pero la plaza se libera ya para la cola.
-- ---------------------------------------------------------------------------

create function public.unenroll(p_enrollment_id uuid)
returns public.enrollments
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.enrollments;
  v_kind text;
  v_today date := public.today_local();
begin
  select e.* into v_row from public.enrollments e
  where e.id = p_enrollment_id and e.family_id = auth.uid() and e.status <> 'baixa'
  for update;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  select kind into v_kind from public.activities where id = v_row.activity_id;

  update public.enrollments set
    status = 'baixa',
    cancelled_at = now(),
    ends_on = case
      when v_row.status = 'confirmada' and not v_row.is_trial and v_kind = 'recurrent'
        then least(coalesce(v_row.ends_on, 'infinity'::date), public.month_end(v_today))
      else least(coalesce(v_row.ends_on, v_today), v_today)
    end
  where id = p_enrollment_id
  returning * into v_row;
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.activities enable row level security;
alter table public.enrollments enable row level security;

revoke all on table public.categories, public.activities, public.enrollments from anon, authenticated;
grant select on table public.categories, public.activities to anon, authenticated;
grant insert, update, delete on table public.categories, public.activities to authenticated;
-- Las familias solo leen; escriben con enroll() y unenroll(). Los admins gestionarán desde el panel (fase 3).
grant select on table public.enrollments to authenticated;
grant update (status, ends_on, cancelled_at, auto_renew) on table public.enrollments to authenticated;

create policy "Categorías públicas" on public.categories for select to anon, authenticated using (true);
create policy "Solo admins gestionan categorías" on public.categories for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "Actividades publicadas visibles para todos" on public.activities for select to anon, authenticated
  using (status in ('publicada', 'finalitzada', 'cancellada') or (select public.is_admin()));
create policy "Solo admins gestionan actividades" on public.activities for all to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "La familia ve sus inscripciones; los admins todas" on public.enrollments for select to authenticated
  using (family_id = (select auth.uid()) or (select public.is_admin()));
create policy "Solo admins editan inscripciones directamente" on public.enrollments for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

revoke execute on function public.enroll(uuid, uuid[], boolean, date), public.unenroll(uuid),
  public.my_queue_positions(), public.activity_spots(), public.is_occupying(public.enrollments)
  from public, anon;
grant execute on function public.enroll(uuid, uuid[], boolean, date), public.unenroll(uuid),
  public.my_queue_positions(), public.is_occupying(public.enrollments) to authenticated;
grant execute on function public.activity_spots() to anon, authenticated;
-- Las políticas públicas de actividades preguntan si quien mira es admin; sin sesión siempre es false.
grant execute on function public.is_admin() to anon;
