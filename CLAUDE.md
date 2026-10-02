@AGENTS.md

# Família Amic

- Alcance y decisiones de negocio: `docs/alcance-v1.md`. No añadir funciones fuera de la V1 sin preguntar.
- Interfaz bilingüe: todo texto visible va en `src/i18n/dictionaries/ca.json` y `es.json` (mismas claves). Catalán por defecto.
- Next.js 16: el middleware se llama `proxy` (`src/proxy.ts`); `params` y `cookies()` son asíncronos.
- Supabase: usar `src/lib/supabase/server.ts` en servidor y `client.ts` en cliente; crear un cliente por petición.
- Datos sensibles (DNI, IBAN, salud): acceso siempre controlado con RLS en la base de datos. Repo público: nunca datos reales ni claves.
- Antes de un PR: `npm run lint && npm run typecheck && npm run build`.

## Estado (septiembre de 2026)

Fases 0-5 de `docs/alcance-v1.md` hechas y fusionadas en `main`: cuentas, actividades con cola y prueba, panel con 2FA, recibos manuales (CaixaBank + Excel) y contenido (portada, Associació, noticias, recursos, contacto, voluntariado, fotos, legales).
Después: ajustes manuales de recibos, categorías editables en el panel, estadísticas sin cookies (Umami, opcional por variable de entorno), sitemap y robots.
Después: sección Projectes (editable en el panel, con portada y galería), imagen de portada subida desde el panel en noticias y actividades (`src/components/admin/image-input.tsx`), menú hamburguesa en todas las pantallas y botón "Accedir" siempre visible en la cabecera.
Después (cambio estético, PR "Inicio nuevo"): colores claros y siempre en modo claro (sin modo oscuro), inicio con fotos que pasan (Panell → Portada, tabla `home_slides`), destacados con fechas `featured_from`/`featured_until` en noticias y actividades, filas de tarjetas que avanzan solas (`src/components/home/`), galería de fotos también en noticias (`news_photos`) y visor con flechas y ventana en grande (`src/components/content/gallery.tsx`). En listados y detalles el orden es título → portada → subtítulo.
Después: logo en la cabecera e iconos (`public/logo-familia-amic.png`, `src/app/icon.png`). Encuadre de portadas: el admin arrastra la foto y la amplía (`src/components/admin/frame-editor.tsx`); se guarda en la propia dirección como `…/foto.jpg#encuadre=x,y,zoom` (`src/lib/image-frame.ts`), sin columnas nuevas, y quien pinta una portada usa `framed()`. Los formularios de noticias, actividades y proyectos llevan vista previa en directo (`src/components/admin/live-preview.tsx`).
La web ya está publicada en Vercel (se despliega sola con cada push a `main`).
Falta el lanzamiento (dominio desde IONOS). Vercel y el correo con Gmail ya funcionan.

## Decisiones de negocio confirmadas por Luis

- Una ficha de socio pendiente ya permite inscribirse (la revisión es rápida).
- Recibos: solo familias con la ficha aprobada; la cuota anual se cobra el mes del alta; una actividad se cobra el mes entero si hubo plaza algún día; las pruebas no se cobran. Las excepciones se hacen con ajustes manuales (Panell → Rebuts → Ajustos).
- Cuota y precios los fija la junta desde el panel, nunca en el código.

## Cómo trabajamos

- Luis (que habla en castellano) revisa y fusiona cada PR y lo prueba en local en Windows (PowerShell) con Supabase alojado. Cada migración nueva la ejecuta él a mano en el SQL Editor: dile siempre cuáles.
- Una rama y un PR por bloque de trabajo, contra `main`.
- Estilo del repo: líneas largas, sin Prettier. Server Actions en `src/lib/actions/`, consultas en `src/lib/*.ts` (server-only), componentes de formulario en `src/components/form.tsx` con `useActionState`.
- Admin = `is_admin()` en la base de datos, que exige sesión con 2FA (aal2). Toda acción delicada del panel va en una RPC `security definer` o con RLS, y se apunta en `admin_log` con `logAction`.
- DNI e IBAN se cifran en el servidor con `src/lib/crypto.ts` (AES-256-GCM, `DATA_ENCRYPTION_KEY`).
- Textos: lenguaje inclusivo ("Registra't", nunca "registra a tu familia"; la cuenta es de la persona adulta responsable o de quien la gestione).
- Sin pago online en la V1.
- Contenido real con nombres de personas (junta, equipo, familias) no se sube al repo.
- Imágenes: bucket público `fotos` de Supabase Storage; el navegador del admin sube el fichero y la base de datos guarda la ruta o la dirección. Para probar Storage en local, cambia temporalmente `[storage] enabled = true` en `supabase/config.toml` (no lo subas).
- Pruebas: `npm test` (vitest). Supabase local con `npx supabase start` y `npx supabase db reset` (Storage puede no arrancar en local; la migración de fotos lo tolera).
