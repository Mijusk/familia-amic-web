-- Datos de ejemplo SOLO para desarrollo local (npx supabase db reset). No son datos reales.
insert into public.activities
  (slug, lang, title, summary, description, category_id, kind, weekday, start_time, end_time, starts_on, ends_on,
   location, capacity, price_cents, payment_method, payment_notes, status)
values
  ('padel-dijous', 'ca', 'Pàdel adaptat', 'Classes de pàdel per a tots els nivells, amb monitors especialitzats.',
   'Cada dijous a la tarda. Portem pales i pilotes; només cal roba còmoda i ganes de passar-ho bé.',
   (select id from public.categories where slug = 'esportives'), 'recurrent', 4, '18:15', '19:45',
   date_trunc('month', now())::date, null, 'Club de pàdel de Valldoreix', 2, 4000, 'rebut', '', 'publicada'),
  ('futbol-dilluns', 'ca', 'Futbol inclusiu', 'Entrenament de futbol cada dilluns.',
   'Juguem en equip, sense competició, perquè tothom hi tingui lloc.',
   (select id from public.categories where slug = 'esportives'), 'recurrent', 1, '17:30', '18:30',
   date_trunc('month', now())::date, null, 'Camp municipal de Valldoreix', null, 3000, 'rebut', '', 'publicada'),
  ('musica-dimarts', 'es', 'Música en grupo', 'Taller de música y percusión los martes.',
   'Cantamos, tocamos y creamos canciones juntos.',
   (select id from public.categories where slug = 'musica'), 'recurrent', 2, '18:00', '19:00',
   date_trunc('month', now())::date, null, 'Local de Família Amic', 10, null, 'gratuit', '', 'publicada'),
  ('portaventura', 'ca', 'Excursió a PortAventura', 'Un dia sencer al parc amb les famílies.',
   'Sortida en autocar des de Valldoreix a les 8:00 i tornada cap a les 20:00.',
   (select id from public.categories where slug = 'socials'), 'puntual', null, null, null,
   (now() + interval '20 days')::date, null, 'PortAventura World', 30, 4500, 'transferencia',
   'Fes un Bizum o una transferència posant el nom del participant com a concepte.', 'publicada'),
  ('taller-esborrany', 'ca', 'Taller en preparació', 'Encara no és visible.', '',
   (select id from public.categories where slug = 'tallers'), 'puntual', null, null, null,
   (now() + interval '40 days')::date, null, '', null, null, 'gratuit', '', 'esborrany');
