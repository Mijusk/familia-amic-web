@AGENTS.md

# Família Amic

- Alcance y decisiones de negocio: `docs/alcance-v1.md`. No añadir funciones fuera de la V1 sin preguntar.
- Interfaz bilingüe: todo texto visible va en `src/i18n/dictionaries/ca.json` y `es.json` (mismas claves). Catalán por defecto.
- Next.js 16: el middleware se llama `proxy` (`src/proxy.ts`); `params` y `cookies()` son asíncronos.
- Supabase: usar `src/lib/supabase/server.ts` en servidor y `client.ts` en cliente; crear un cliente por petición.
- Datos sensibles (DNI, IBAN, salud): acceso siempre controlado con RLS en la base de datos. Repo público: nunca datos reales ni claves.
- Antes de un PR: `npm run lint && npm run typecheck && npm run build`.

## Estado (septiembre de 2026)

Fases 0-5 de `docs/alcance-v1.md` hechas y fusionadas en `main`: cuentas, actividades con cola y prueba, panel con 2FA, recibos manuales (CaixaBank + Excel) y contenido (portada, Associació, noticias, recursos, contacto, voluntariado, fotos, legales). Falta el lanzamiento (Vercel, correo, analítica sin cookies, SEO, dominio) y los ajustes de Luis.

## Cómo trabajamos

- Luis (que habla en castellano) revisa y fusiona cada PR y lo prueba en local en Windows (PowerShell) con Supabase alojado. Cada migración nueva la ejecuta él a mano en el SQL Editor: dile siempre cuáles.
- Una rama y un PR por bloque de trabajo, contra `main`.
- Estilo del repo: líneas largas, sin Prettier. Server Actions en `src/lib/actions/`, consultas en `src/lib/*.ts` (server-only), componentes de formulario en `src/components/form.tsx` con `useActionState`.
- Admin = `is_admin()` en la base de datos, que exige sesión con 2FA (aal2). Toda acción delicada del panel va en una RPC `security definer` o con RLS, y se apunta en `admin_log` con `logAction`.
- DNI e IBAN se cifran en el servidor con `src/lib/crypto.ts` (AES-256-GCM, `DATA_ENCRYPTION_KEY`).
- Textos: lenguaje inclusivo ("Registra't", nunca "registra a tu familia"; la cuenta es de la persona adulta responsable o de quien la gestione).
- Precios y cuota: nunca en el código; se editan en Panell → Rebuts (pendientes de la junta). Sin pago online en la V1.
- Contenido real con nombres de personas (junta, equipo, familias) no se sube al repo.
- Pruebas: `npm test` (vitest). Supabase local con `npx supabase start` y `npx supabase db reset` (Storage puede no arrancar en local; la migración de fotos lo tolera).
