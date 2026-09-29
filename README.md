# Família Amic · Web

Nueva web de [Família Amic](https://www.familiaamic.cat/), la asociación de Valldoreix que lucha por la
inclusión en el día a día de las personas con discapacidad y sus familias.

Sustituye a la web actual (constructor de IONOS) y a los Google Forms de inscripción: las familias tendrán
una cuenta donde guardan sus datos una sola vez y desde la que se apuntan a las actividades, y la
asociación tendrá un panel para gestionar actividades, inscritos, socios y recibos.

- Qué hace la V1 y qué no: [`docs/alcance-v1.md`](docs/alcance-v1.md)
- Diseño de datos y flujos: página de diseño V1 compartida en el proyecto de Claude

## Stack

| Pieza | Para qué |
| --- | --- |
| [Next.js](https://nextjs.org/) 16 (App Router, TypeScript) | Las páginas, formularios, la cuenta de cada familia y el panel de admin |
| [Tailwind CSS](https://tailwindcss.com/) 4 | Estilos |
| [Supabase](https://supabase.com/) | Base de datos (Postgres), inicio de sesión y reglas de acceso |
| [Vercel](https://vercel.com/) | Publicar la web |

Todo funciona con los planes gratuitos mientras desarrollamos.

## Arrancar en local

Necesitas [Node.js](https://nodejs.org/) 20 o superior y Git.

```bash
git clone https://github.com/Mijusk/familia-amic-web.git
cd familia-amic-web
npm install
cp .env.example .env.local   # rellena las claves de Supabase (opcional por ahora)
npm run dev
```

Abre <http://localhost:3000>. Te redirige a `/ca` o `/es` según el idioma del navegador.

Sin claves de Supabase la web arranca igual; solo hacen falta para el login, que llega en la fase 1.
Las claves están en Supabase → Project Settings → API (`Project URL` y `Publishable key`).

### Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila para producción |
| `npm start` | Arranca la versión compilada |
| `npm run lint` | Revisa el código con ESLint |
| `npm run typecheck` | Comprueba los tipos de TypeScript |

## Estructura

```
src/
  app/[lang]/        Páginas; [lang] es ca o es
  components/        Cabecera, pie, selector de idioma…
  config/site.ts     Datos de contacto de la entidad
  i18n/              Idiomas y textos (dictionaries/ca.json, es.json)
  lib/supabase/      Clientes de Supabase para servidor, navegador y proxy
  proxy.ts           Redirige al idioma y refresca la sesión en cada petición
docs/                Alcance y decisiones
```

### Textos e idiomas

Todos los textos de la interfaz están en `src/i18n/dictionaries/ca.json` y `es.json`, con las mismas claves.
Para añadir un texto, añádelo en los dos ficheros. El idioma por defecto es el catalán, y el que elige el
visitante con el selector se recuerda en una cookie.

## Publicar en Vercel

1. En [vercel.com](https://vercel.com/new) importa este repositorio.
2. Añade las variables de `.env.example` en Settings → Environment Variables.
3. Cada push a `main` se publica solo; cada pull request tiene su propia dirección de prueba.

El dominio `familiaamic.cat` sigue en IONOS y no se toca hasta el lanzamiento.

## Reglas del proyecto

- Nunca subas `.env.local`, datos reales de familias ni exportaciones de recibos: este repositorio es público.
- Los datos sensibles (DNI, IBAN, salud) se protegen en la base de datos con Row Level Security.
- Cada cambio va en una rama y un pull request; la integración continua comprueba lint, tipos y compilación.
