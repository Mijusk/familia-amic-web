-- Fase 4: recibos mensuales.
-- No hay pago online: el panel calcula los recibos del mes y da la lista para meterlos a mano en el banco
-- (CaixaBank) y un Excel. La familia ve sus recibos en su cuenta.

-- ---------------------------------------------------------------------------
-- Inscripciones: saber si una inscripción llegó a tener plaza
-- ---------------------------------------------------------------------------
-- Una baja desde la lista de espera y una baja de alguien que iba se ven igual ('baixa');
-- confirmed_at las distingue para no cobrar a quien nunca tuvo plaza.

alter table public.enrollments add column confirmed_at timestamptz;
update public.enrollments set confirmed_at = created_at where status = 'confirmada';

create function public.set_confirmed_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.status = 'confirmada' and new.confirmed_at is null then
    new.confirmed_at := now();
  end if;
  return new;
end;
$$;

create trigger enrollments_confirmed_at before insert or update on public.enrollments
  for each row execute function public.set_confirmed_at();

-- ---------------------------------------------------------------------------
-- Precios generales (se cambian desde el panel; la lista de precios depende de la junta)
-- ---------------------------------------------------------------------------

create table public.billing_settings (
  id boolean primary key default true check (id),
  -- Cuota anual de socio por familia; null = aún sin fijar (no se cobra).
  membership_fee_cents integer check (membership_fee_cents between 0 and 100000),
  -- Descuento por participante en cada actividad a partir de la segunda (la más cara va a precio completo).
  multi_activity_discount_pct integer not null default 0 check (multi_activity_discount_pct between 0 and 100),
  updated_at timestamptz not null default now()
);

insert into public.billing_settings (id) values (true);

create trigger billing_settings_updated_at before update on public.billing_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Recibos
-- ---------------------------------------------------------------------------

create table public.receipts (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles (id) on delete cascade,
  -- Primer día del mes que se cobra.
  period date not null check (extract(day from period) = 1),
  total_cents integer not null check (total_cents >= 0),
  -- pendent: calculado, falta cobrarlo; cobrat; retornat: el banco lo devolvió; anullat: no se cobra.
  status text not null default 'pendent' check (status in ('pendent', 'cobrat', 'retornat', 'anullat')),
  -- Copia de los datos del mandato en el momento de generarlo (el IBAN se descifra solo en el panel).
  holder_name text not null,
  sepa_reference text not null,
  sepa_accepted_at timestamptz not null,
  iban_last4 text not null,
  status_changed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, period)
);

create index receipts_period_idx on public.receipts (period, status);

create trigger receipts_updated_at before update on public.receipts
  for each row execute function public.set_updated_at();

create table public.receipt_lines (
  id bigint generated always as identity primary key,
  receipt_id uuid not null references public.receipts (id) on delete cascade,
  position integer not null,
  -- quota: cuota anual de socio; activitat: mes de una actividad; descompte: descuento por varias actividades.
  kind text not null check (kind in ('quota', 'activitat', 'descompte')),
  activity_id uuid references public.activities (id) on delete set null,
  participant_id uuid references public.participants (id) on delete set null,
  activity_title text,
  participant_name text,
  discount_pct integer,
  amount_cents integer not null
);

create index receipt_lines_receipt_idx on public.receipt_lines (receipt_id, position);

-- ---------------------------------------------------------------------------
-- Generar los recibos de un mes
-- ---------------------------------------------------------------------------
-- Se cobra a las familias socias activas:
--   · la cuota anual, el mes en que se dieron de alta (cada año);
--   · cada actividad "rebut" en la que un participante ha tenido plaza algún día del mes, mes completo;
--     las puntuales, el mes en que empiezan; las pruebas nunca;
--   · descuento por participante en sus actividades a partir de la segunda.
-- Volver a generar recalcula solo los recibos 'pendent'; los cobrados, devueltos o anulados no se tocan.

create function public.admin_generate_receipts(p_period date)
returns table (created integer, skipped integer)
language plpgsql security definer set search_path = '' as $$
declare
  v_start date := date_trunc('month', p_period)::date;
  v_end date := public.month_end(date_trunc('month', p_period)::date);
  v_settings public.billing_settings;
  v_family record;
  v_receipt uuid;
  v_created integer := 0;
  v_skipped integer := 0;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  select * into v_settings from public.billing_settings;

  create temp table if not exists pg_temp.receipt_draft (
    position integer, kind text, activity_id uuid, participant_id uuid, activity_title text,
    participant_name text, discount_pct integer, amount_cents integer
  ) on commit drop;

  -- Se rehacen los pendientes del mes.
  delete from public.receipts where period = v_start and status = 'pendent';

  for v_family in
    select m.family_id, m.member_since, m.sepa_reference, m.sepa_accepted_at, m.iban_last4, p.full_name
    from public.memberships m
    join public.profiles p on p.id = m.family_id
    where m.status = 'actiu'
  loop
    if exists (select 1 from public.receipts r where r.family_id = v_family.family_id and r.period = v_start) then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    truncate pg_temp.receipt_draft;

    if v_settings.membership_fee_cents > 0
       and v_family.member_since is not null
       and v_family.member_since <= v_end
       and extract(month from v_family.member_since) = extract(month from v_start) then
      insert into pg_temp.receipt_draft values (0, 'quota', null, null, null, null, null, v_settings.membership_fee_cents);
    end if;

    insert into pg_temp.receipt_draft
    select
      row_number() over (order by c.participant_name, c.participant_id, c.rank) * 2 - 1,
      'activitat', c.activity_id, c.participant_id, c.title, c.participant_name, null, c.price_cents
    from (
      select a.id as activity_id, e.participant_id, a.title, a.price_cents,
        pt.first_name || ' ' || pt.last_name as participant_name,
        row_number() over (partition by e.participant_id order by a.price_cents desc, a.title) as rank
      from public.enrollments e
      join public.activities a on a.id = e.activity_id
      join public.participants pt on pt.id = e.participant_id
      where e.family_id = v_family.family_id
        and e.confirmed_at is not null
        and not e.is_trial
        and a.payment_method = 'rebut'
        and coalesce(a.price_cents, 0) > 0
        and e.starts_on <= coalesce(e.ends_on, 'infinity'::date)
        and case
          when a.kind = 'puntual' then a.starts_on between v_start and v_end
          else e.starts_on <= v_end
            and least(coalesce(e.ends_on, 'infinity'::date), coalesce(a.ends_on, 'infinity'::date)) >= v_start
        end
    ) c;

    -- Descuento: una línea negativa bajo cada actividad que no es la primera (la más cara) de su participante.
    if v_settings.multi_activity_discount_pct > 0 then
      insert into pg_temp.receipt_draft
      select d.position + 1, 'descompte', d.activity_id, d.participant_id, d.activity_title, d.participant_name,
        v_settings.multi_activity_discount_pct,
        -round(d.amount_cents * v_settings.multi_activity_discount_pct / 100.0)::integer
      from pg_temp.receipt_draft d
      where d.kind = 'activitat'
        and exists (
          select 1 from pg_temp.receipt_draft o
          -- Hay otra actividad del mismo participante antes en el orden (más cara, o igual y antes por título).
          where o.kind = 'activitat' and o.participant_id = d.participant_id and o.position < d.position
        );
    end if;

    if not exists (select 1 from pg_temp.receipt_draft) or (select sum(amount_cents) from pg_temp.receipt_draft) <= 0 then
      continue;
    end if;

    insert into public.receipts (family_id, period, total_cents, holder_name, sepa_reference, sepa_accepted_at, iban_last4)
    values (v_family.family_id, v_start, (select sum(amount_cents) from pg_temp.receipt_draft),
            v_family.full_name, v_family.sepa_reference, v_family.sepa_accepted_at, v_family.iban_last4)
    returning id into v_receipt;

    insert into public.receipt_lines (receipt_id, position, kind, activity_id, participant_id, activity_title, participant_name, discount_pct, amount_cents)
    select v_receipt, d.position, d.kind, d.activity_id, d.participant_id, d.activity_title, d.participant_name, d.discount_pct, d.amount_cents
    from pg_temp.receipt_draft d;

    v_created := v_created + 1;
  end loop;

  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'receipts_generate', 'period', to_char(v_start, 'YYYY-MM'),
          jsonb_build_object('created', v_created, 'kept', v_skipped));

  created := v_created;
  skipped := v_skipped;
  return next;
end;
$$;

-- ---------------------------------------------------------------------------
-- Estado de los recibos
-- ---------------------------------------------------------------------------

create function public.admin_set_receipt_status(p_receipt_id uuid, p_status text)
returns public.receipts
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.receipts;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if p_status not in ('pendent', 'cobrat', 'retornat', 'anullat') then
    raise exception 'bad_status' using errcode = '22023';
  end if;
  update public.receipts set status = p_status, status_changed_at = now()
  where id = p_receipt_id
  returning * into v_row;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'receipt_status', 'receipt', p_receipt_id::text,
          jsonb_build_object('status', p_status, 'period', to_char(v_row.period, 'YYYY-MM')));
  return v_row;
end;
$$;

-- Marcar como cobrados todos los pendientes del mes (cuando el banco ya los ha pasado).
create function public.admin_mark_period_paid(p_period date)
returns integer
language plpgsql security definer set search_path = '' as $$
declare
  v_count integer;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  update public.receipts set status = 'cobrat', status_changed_at = now()
  where period = date_trunc('month', p_period)::date and status = 'pendent';
  get diagnostics v_count = row_count;
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'receipts_paid', 'period', to_char(p_period, 'YYYY-MM'), jsonb_build_object('count', v_count));
  return v_count;
end;
$$;

create function public.admin_update_billing_settings(p_membership_fee_cents integer, p_discount_pct integer)
returns public.billing_settings
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.billing_settings;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  update public.billing_settings set
    membership_fee_cents = p_membership_fee_cents,
    multi_activity_discount_pct = p_discount_pct
  where id
  returning * into v_row;
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'billing_settings', 'settings', 'billing',
          jsonb_build_object('membership_fee_cents', p_membership_fee_cents, 'discount_pct', p_discount_pct));
  return v_row;
end;
$$;

-- ---------------------------------------------------------------------------
-- Permisos: la familia solo lee sus recibos; todo cambio pasa por las funciones de admin
-- ---------------------------------------------------------------------------

alter table public.billing_settings enable row level security;
alter table public.receipts enable row level security;
alter table public.receipt_lines enable row level security;

revoke all on table public.billing_settings, public.receipts, public.receipt_lines from anon, authenticated;
-- Los precios no son secretos: la cuota se enseña en la ficha de socio.
grant select on table public.billing_settings to anon, authenticated;
grant select on table public.receipts, public.receipt_lines to authenticated;

create policy "Todos leen los precios" on public.billing_settings for select to anon, authenticated using (true);

create policy "La familia ve sus recibos; los admins ven todos" on public.receipts for select to authenticated
  using (family_id = (select auth.uid()) or (select public.is_admin()));

create policy "La familia ve el detalle de sus recibos; los admins, todos" on public.receipt_lines for select to authenticated
  using (exists (
    select 1 from public.receipts r
    where r.id = receipt_id and (r.family_id = (select auth.uid()) or (select public.is_admin()))
  ));

revoke execute on function
  public.admin_generate_receipts(date),
  public.admin_set_receipt_status(uuid, text),
  public.admin_mark_period_paid(date),
  public.admin_update_billing_settings(integer, integer)
  from public, anon;
grant execute on function
  public.admin_generate_receipts(date),
  public.admin_set_receipt_status(uuid, text),
  public.admin_mark_period_paid(date),
  public.admin_update_billing_settings(integer, integer)
  to authenticated;
