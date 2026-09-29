-- Fase 3: panel de administración.
-- Un admin solo actúa como admin si ha entrado con la verificación en dos pasos (sesión aal2):
-- sin el código, la base de datos lo trata como una cuenta normal.

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select auth.jwt() ->> 'aal') = 'aal2', false)
    and exists (
      select 1 from public.profiles
      where id = (select auth.uid()) and account_type = 'admin'
    );
$$;

-- ---------------------------------------------------------------------------
-- Registro de lo que hacen los admins
-- ---------------------------------------------------------------------------

create table public.admin_log (
  id bigint generated always as identity primary key,
  admin_id uuid references public.profiles (id) on delete set null,
  action text not null check (char_length(action) between 2 and 60),
  target_type text check (char_length(target_type) <= 40),
  target_id text check (char_length(target_id) <= 80),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index admin_log_created_idx on public.admin_log (created_at desc);

create function public.log_admin_action(p_action text, p_target_type text, p_target_id text, p_details jsonb default '{}'::jsonb)
returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), p_action, p_target_type, p_target_id, coalesce(p_details, '{}'::jsonb));
end;
$$;

-- ---------------------------------------------------------------------------
-- Familias con su correo (el correo vive en auth.users, que no es accesible desde la API)
-- ---------------------------------------------------------------------------

create function public.admin_list_accounts()
returns table (
  id uuid, email text, full_name text, phone text, account_type public.account_type, created_at timestamptz,
  membership_status text, participants integer
)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  return query
    select p.id, u.email::text, p.full_name, p.phone, p.account_type, p.created_at, m.status,
      (select count(*)::integer from public.participants x where x.family_id = p.id)
    from public.profiles p
    join auth.users u on u.id = p.id
    left join public.memberships m on m.family_id = p.id
    order by p.created_at desc;
end;
$$;

-- Correos de un grupo de cuentas (para las listas de inscritos).
create function public.admin_account_emails(p_ids uuid[])
returns table (id uuid, email text)
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  return query select u.id, u.email::text from auth.users u where u.id = any (p_ids);
end;
$$;

-- ---------------------------------------------------------------------------
-- Socios: solo un admin cambia el estado de una ficha
-- ---------------------------------------------------------------------------

create function public.admin_set_membership_status(p_family_id uuid, p_status text)
returns public.memberships
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.memberships;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if p_status not in ('pendent', 'actiu', 'baixa') then
    raise exception 'bad_status' using errcode = '22023';
  end if;
  update public.memberships set
    status = p_status,
    member_since = case when p_status = 'actiu' then coalesce(member_since, public.today_local()) else member_since end
  where family_id = p_family_id
  returning * into v_row;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'membership_status', 'family', p_family_id::text, jsonb_build_object('status', p_status));
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Inscripciones: pasar de la cola a plaza confirmada, o dar de baja
-- ---------------------------------------------------------------------------

create function public.admin_confirm_enrollment(p_enrollment_id uuid, p_over_capacity boolean default false)
returns public.enrollments
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.enrollments;
  v_activity public.activities;
  v_today date := public.today_local();
  v_occupied integer;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  select * into v_row from public.enrollments where id = p_enrollment_id for update;
  if not found or v_row.status <> 'cua' then
    raise exception 'not_in_queue' using errcode = 'P0002';
  end if;
  select * into v_activity from public.activities where id = v_row.activity_id for update;
  select count(*) into v_occupied from public.enrollments e
    where e.activity_id = v_activity.id and public.is_occupying(e);
  if v_activity.capacity is not null and v_occupied >= v_activity.capacity and not p_over_capacity then
    raise exception 'full' using errcode = '22023';
  end if;

  update public.enrollments set
    status = 'confirmada',
    starts_on = greatest(v_today, v_activity.starts_on),
    ends_on = case
      when v_activity.kind = 'puntual' then coalesce(v_activity.ends_on, v_activity.starts_on)
      when v_row.auto_renew then v_activity.ends_on
      else least(public.month_end(greatest(v_today, v_activity.starts_on)), coalesce(v_activity.ends_on, 'infinity'::date))
    end
  where id = p_enrollment_id
  returning * into v_row;

  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'enrollment_confirm', 'enrollment', p_enrollment_id::text,
          jsonb_build_object('activity', v_activity.slug, 'over_capacity', p_over_capacity));
  return v_row;
end;
$$;

create function public.admin_cancel_enrollment(p_enrollment_id uuid)
returns public.enrollments
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.enrollments;
  v_kind text;
  v_today date := public.today_local();
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  select * into v_row from public.enrollments where id = p_enrollment_id and status <> 'baixa' for update;
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
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'enrollment_cancel', 'enrollment', p_enrollment_id::text, '{}'::jsonb);
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Admins: un admin puede nombrar a otro, pero nadie puede quitar a otro admin
-- ---------------------------------------------------------------------------

create function public.admin_grant_admin(p_email text)
returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  select id into v_id from auth.users where lower(email) = lower(trim(p_email)) and email_confirmed_at is not null;
  if v_id is null then
    raise exception 'no_account' using errcode = 'P0002';
  end if;
  update public.profiles set account_type = 'admin' where id = v_id;
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'admin_grant', 'profile', v_id::text, jsonb_build_object('email', lower(trim(p_email))));
  return v_id;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permisos
-- ---------------------------------------------------------------------------

alter table public.admin_log enable row level security;
revoke all on table public.admin_log from anon, authenticated;
grant select on table public.admin_log to authenticated;
create policy "Solo admins leen el registro" on public.admin_log for select to authenticated
  using ((select public.is_admin()));

revoke execute on function
  public.log_admin_action(text, text, text, jsonb),
  public.admin_list_accounts(),
  public.admin_account_emails(uuid[]),
  public.admin_set_membership_status(uuid, text),
  public.admin_confirm_enrollment(uuid, boolean),
  public.admin_cancel_enrollment(uuid),
  public.admin_grant_admin(text)
  from public, anon;
grant execute on function
  public.log_admin_action(text, text, text, jsonb),
  public.admin_list_accounts(),
  public.admin_account_emails(uuid[]),
  public.admin_set_membership_status(uuid, text),
  public.admin_confirm_enrollment(uuid, boolean),
  public.admin_cancel_enrollment(uuid),
  public.admin_grant_admin(text)
  to authenticated;
