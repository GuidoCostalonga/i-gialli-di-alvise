-- Conteggio anonimo delle visite di igiallidialvise.it.
-- Nessun indirizzo IP, nessun identificativo del visitatore, nessun cookie.
create table if not exists public.alvise_visite (
  id bigint generated always as identity primary key,
  quando timestamptz not null default now(),
  pagina text not null check (char_length(pagina) between 1 and 200),
  provenienza text not null default 'diretta' check (char_length(provenienza) between 1 and 100),
  dispositivo text not null check (dispositivo in ('telefono', 'tablet', 'computer'))
);
create index if not exists alvise_visite_quando_idx on public.alvise_visite (quando);

-- Nessuno legge o scrive la tabella dal navigatore: passa tutto dalle funzioni.
alter table public.alvise_visite enable row level security;
revoke all on public.alvise_visite from anon, authenticated;

create or replace function public.alvise_statistiche()
returns jsonb
language sql
stable
set search_path = ''
as $$
  with v as (
    select (quando at time zone 'Europe/Rome')::date as giorno, pagina, provenienza, dispositivo
    from public.alvise_visite
  ),
  oggi as (select (now() at time zone 'Europe/Rome')::date as d),
  trenta as (select v.* from v, oggi where v.giorno > oggi.d - 30)
  select jsonb_build_object(
    'aggiornato', to_char(now() at time zone 'Europe/Rome', 'YYYY-MM-DD"T"HH24:MI'),
    'dal', (select min(giorno) from v),
    'pagine_viste', jsonb_build_object(
      'oggi', (select count(*) from v, oggi where v.giorno = oggi.d),
      'ieri', (select count(*) from v, oggi where v.giorno = oggi.d - 1),
      'sette_giorni', (select count(*) from v, oggi where v.giorno > oggi.d - 7),
      'trenta_giorni', (select count(*) from trenta),
      'totale', (select count(*) from v)),
    'ingressi', jsonb_build_object(
      'oggi', (select count(*) from v, oggi where v.giorno = oggi.d and v.provenienza <> 'interna'),
      'ieri', (select count(*) from v, oggi where v.giorno = oggi.d - 1 and v.provenienza <> 'interna'),
      'sette_giorni', (select count(*) from v, oggi where v.giorno > oggi.d - 7 and v.provenienza <> 'interna'),
      'trenta_giorni', (select count(*) from trenta where provenienza <> 'interna'),
      'totale', (select count(*) from v where provenienza <> 'interna')),
    'giorni', (select coalesce(jsonb_agg(jsonb_build_object('giorno', g.d, 'pagine', coalesce(c.n, 0), 'ingressi', coalesce(c.i, 0)) order by g.d), '[]'::jsonb)
               from (select generate_series(oggi.d - 29, oggi.d, interval '1 day')::date as d from oggi) g
               left join (select giorno, count(*) as n, count(*) filter (where provenienza <> 'interna') as i from trenta group by giorno) c on c.giorno = g.d),
    'pagine', (select coalesce(jsonb_agg(jsonb_build_object('voce', pagina, 'n', n) order by n desc, pagina), '[]'::jsonb)
               from (select pagina, count(*) as n from trenta group by pagina order by n desc, pagina limit 20) p),
    'provenienze', (select coalesce(jsonb_agg(jsonb_build_object('voce', provenienza, 'n', n) order by n desc, provenienza), '[]'::jsonb)
               from (select provenienza, count(*) as n from trenta where provenienza <> 'interna' group by provenienza order by n desc, provenienza limit 15) p),
    'dispositivi', (select coalesce(jsonb_agg(jsonb_build_object('voce', dispositivo, 'n', n) order by n desc), '[]'::jsonb)
               from (select dispositivo, count(*) as n from trenta group by dispositivo) p)
  );
$$;
revoke execute on function public.alvise_statistiche() from public, anon, authenticated;
grant execute on function public.alvise_statistiche() to service_role;
