@AGENTS.md

# Família Amic

- Alcance y decisiones de negocio: `docs/alcance-v1.md`. No añadir funciones fuera de la V1 sin preguntar.
- Interfaz bilingüe: todo texto visible va en `src/i18n/dictionaries/ca.json` y `es.json` (mismas claves). Catalán por defecto.
- Next.js 16: el middleware se llama `proxy` (`src/proxy.ts`); `params` y `cookies()` son asíncronos.
- Supabase: usar `src/lib/supabase/server.ts` en servidor y `client.ts` en cliente; crear un cliente por petición.
- Datos sensibles (DNI, IBAN, salud): acceso siempre controlado con RLS en la base de datos. Repo público: nunca datos reales ni claves.
- Antes de un PR: `npm run lint && npm run typecheck && npm run build`.
