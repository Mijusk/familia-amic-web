-- Ajustes manuales en los recibos (excepciones).
--
-- Un admin puede añadir a una familia socia, para un mes, una línea extra con su concepto: un cargo
-- (p. ej. material) o un descuento (p. ej. una beca). Se guarda aparte y el cálculo del mes la añade al
-- recibo, así que volver a calcular no la pierde. Solo se puede tocar mientras el recibo está pendiente.

create table public.receipt_adjustments (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.profiles (id) on delete cascade,
  period date not null check (extract(day from period) = 1),
  concept text not null check (char_length(concept) between 2 and 120),
  -- En céntimos; negativo = descuento.
  amount_cents integer not null check (amount_cents <> 0 and amount_cents between -1000000 and 1000000),
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index receipt_adjustments_period_idx on public.receipt_adjustments (period, family_id);

alter table public.receipt_lines drop constraint receipt_lines_kind_check;
alter table public.receipt_lines add constraint receipt_lines_kind_check check (kind in ('quota', 'activitat', 'descompte', 'ajust'));
alter table public.receipt_lines add column adjustment_id uuid references public.receipt_adjustments (id) on delete set null;

alter table public.receipt_adjustments enable row level security;
revoke all on table public.receipt_adjustments from anon, authenticated;
grant select on table public.receipt_adjustments to authenticated;
create policy "Solo admins ven los ajustes" on public.receipt_adjustments for select to authenticated
  using ((select public.is_admin()));

create or replace function public.admin_generate_receipts(p_period date)
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
    participant_name text, discount_pct integer, amount_cents integer, adjustment_id uuid
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
      insert into pg_temp.receipt_draft values (0, 'quota', null, null, null, null, null, v_settings.membership_fee_cents, null);
    end if;

    insert into pg_temp.receipt_draft
    select
      row_number() over (order by c.participant_name, c.participant_id, c.rank) * 2 - 1,
      'activitat', c.activity_id, c.participant_id, c.title, c.participant_name, null, c.price_cents, null
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
        -round(d.amount_cents * v_settings.multi_activity_discount_pct / 100.0)::integer, null
      from pg_temp.receipt_draft d
      where d.kind = 'activitat'
        and exists (
          select 1 from pg_temp.receipt_draft o
          -- Hay otra actividad del mismo participante antes en el orden (más cara, o igual y antes por título).
          where o.kind = 'activitat' and o.participant_id = d.participant_id and o.position < d.position
        );
    end if;

    -- Ajustes manuales del panel (excepciones): al final del recibo.
    insert into pg_temp.receipt_draft
    select 10000 + row_number() over (order by a.created_at), 'ajust', null, null, a.concept, null, null, a.amount_cents, a.id
    from public.receipt_adjustments a
    where a.family_id = v_family.family_id and a.period = v_start;

    if not exists (select 1 from pg_temp.receipt_draft) or (select sum(amount_cents) from pg_temp.receipt_draft) <= 0 then
      continue;
    end if;

    insert into public.receipts (family_id, period, total_cents, holder_name, sepa_reference, sepa_accepted_at, iban_last4)
    values (v_family.family_id, v_start, (select sum(amount_cents) from pg_temp.receipt_draft),
            v_family.full_name, v_family.sepa_reference, v_family.sepa_accepted_at, v_family.iban_last4)
    returning id into v_receipt;

    insert into public.receipt_lines (receipt_id, position, kind, activity_id, participant_id, activity_title, participant_name, discount_pct, amount_cents, adjustment_id)
    select v_receipt, d.position, d.kind, d.activity_id, d.participant_id, d.activity_title, d.participant_name, d.discount_pct, d.amount_cents, d.adjustment_id
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

-- Si la familia ya tiene el recibo del mes cobrado, devuelto o anulado, no se le puede ajustar.
create function public.receipt_is_closed(p_family uuid, p_period date) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.receipts r
    where r.family_id = p_family and r.period = p_period and r.status <> 'pendent'
  );
$$;

create function public.admin_add_receipt_adjustment(p_family_id uuid, p_period date, p_concept text, p_amount_cents integer)
returns public.receipt_adjustments
language plpgsql security definer set search_path = '' as $$
declare
  v_period date := date_trunc('month', p_period)::date;
  v_row public.receipt_adjustments;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  if not exists (select 1 from public.memberships m where m.family_id = p_family_id and m.status = 'actiu') then
    raise exception 'not_member' using errcode = '22023';
  end if;
  if public.receipt_is_closed(p_family_id, v_period) then
    raise exception 'receipt_closed' using errcode = '22023';
  end if;
  insert into public.receipt_adjustments (family_id, period, concept, amount_cents, created_by)
  values (p_family_id, v_period, trim(p_concept), p_amount_cents, auth.uid())
  returning * into v_row;
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'receipt_adjust', 'profile', p_family_id::text,
          jsonb_build_object('period', to_char(v_period, 'YYYY-MM'), 'concept', v_row.concept, 'amount_cents', p_amount_cents));
  return v_row;
end;
$$;

create function public.admin_delete_receipt_adjustment(p_id uuid)
returns date
language plpgsql security definer set search_path = '' as $$
declare
  v_row public.receipt_adjustments;
begin
  if not public.is_admin() then
    raise exception 'not_admin' using errcode = '42501';
  end if;
  select * into v_row from public.receipt_adjustments where id = p_id;
  if not found then
    raise exception 'not_found' using errcode = 'P0002';
  end if;
  if public.receipt_is_closed(v_row.family_id, v_row.period) then
    raise exception 'receipt_closed' using errcode = '22023';
  end if;
  delete from public.receipt_adjustments where id = p_id;
  insert into public.admin_log (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'receipt_adjust_delete', 'profile', v_row.family_id::text,
          jsonb_build_object('period', to_char(v_row.period, 'YYYY-MM'), 'concept', v_row.concept, 'amount_cents', v_row.amount_cents));
  return v_row.period;
end;
$$;

revoke execute on function
  public.receipt_is_closed(uuid, date),
  public.admin_add_receipt_adjustment(uuid, date, text, integer),
  public.admin_delete_receipt_adjustment(uuid)
  from public, anon;
grant execute on function
  public.admin_add_receipt_adjustment(uuid, date, text, integer),
  public.admin_delete_receipt_adjustment(uuid)
  to authenticated;

