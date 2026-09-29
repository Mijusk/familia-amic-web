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
cp .env.example .env.local   # y rellénalo (ver abajo)
npm run dev
```

Abre <http://localhost:3000>. Te redirige a `/ca` o `/es` según el idioma del navegador.

Sin claves de Supabase la web arranca igual, pero sin registro ni cuentas.

### Variables de entorno

| Variable | De dónde sale |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Project Settings → API (`Project URL` y `Publishable key`) |
| `DATA_ENCRYPTION_KEY` | Clave para cifrar DNI e IBAN. Genera una con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`. Usa la misma en local y en Vercel si compartís base de datos, y guárdala en un gestor de contraseñas: si se pierde, los DNI e IBAN guardados no se pueden leer. |
| `NEXT_PUBLIC_SITE_URL` | La dirección de la web, para los enlaces de los correos (`http://localhost:3000` en local) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM` | Servidor de correo para las confirmaciones de inscripción y los avisos de baja. Ver [Correo](#correo). Sin ellos la web funciona, pero no envía esos correos. |
| `ASSOCIATION_EMAIL` | Adónde llegan los avisos de baja. Por defecto, `familiaamic@gmail.com`. |

Nunca pegues la *secret key* de Supabase en el código ni en `.env.example`: la web no la necesita.

## Base de datos

Las tablas y sus reglas de acceso están en `supabase/migrations/`. Para aplicarlas a tu proyecto de Supabase:

- **Opción fácil:** Supabase → SQL Editor → pega el contenido de cada fichero de `supabase/migrations/`, en orden, y ejecútalo.
  Solo hace falta ejecutar los ficheros nuevos que aún no hayas aplicado.
- **Con la CLI:** `npx supabase login`, `npx supabase link --project-ref <ref-del-proyecto>` y `npx supabase db push`.

En Supabase → Authentication → URL Configuration pon la *Site URL* (la dirección de la web) y añade a
*Redirect URLs* `http://localhost:3000/**` y la dirección de Vercel con `/**`, para que funcionen los enlaces de
confirmación y de nueva contraseña.

### Correo

La web envía dos tipos de correo: los de la cuenta (confirmar el registro, nueva contraseña), que manda Supabase,
y los de las actividades (confirmación de inscripción, aviso de baja a la asociación), que manda la propia web.

La opción sin coste y sin tocar el dominio es usar el Gmail de la entidad con una *contraseña de aplicación*:
en la cuenta de Google, Seguridad → Verificación en dos pasos (activarla) → Contraseñas de aplicaciones. Con esa
contraseña:

- En Vercel y `.env.local`: `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=familiaamic@gmail.com`,
  `SMTP_PASS=<contraseña de aplicación>`.
- En Supabase → Authentication → Emails → SMTP Settings, los mismos datos. Así los correos de la cuenta también
  salen de familiaamic@gmail.com y desaparece el límite de pocos envíos por hora del correo de prueba de Supabase.

Gmail permite unos 500 envíos al día, de sobra para la asociación.

### Primeros administradores

Nadie puede darse permisos de admin desde la web. Cuando la persona se haya registrado, en el SQL Editor:

```sql
update public.profiles set account_type = 'admin'
where id in (select id from auth.users where email = 'correo@ejemplo.com');
```

A partir de ahí, un admin puede nombrar a otros desde el panel (Panell → Administradors). Nadie puede quitar
a otro admin desde la web: eso se hace en el SQL Editor, cambiando `account_type` a `'familia'`.

### Panel de administración y verificación en dos pasos

El panel está en `/ca/admin`. La primera vez pide activar la verificación en dos pasos con una app de
códigos (Google Authenticator, Microsoft Authenticator…) y, después, un código cada vez que se entra.
La base de datos solo trata a alguien como admin si ha entrado con ese código: con la contraseña sola,
una cuenta admin no ve datos de nadie.

En Supabase, Authentication → Multi-Factor debe tener **TOTP** activado (lo está por defecto). Si un admin
pierde el móvil, otro puede borrarle el factor en Authentication → Users → (la persona) → MFA, y la
próxima vez que entre volverá a escanear el QR.

Desde el panel se crean y editan actividades, se ve quién está inscrito (con sus datos de salud y el
contacto de la familia), se da plaza a la lista de espera, se validan las fichas de socio y se consultan
los datos de cada familia. Todo queda en Panell → Registre.

### Recibos

No hay pago online. Cada mes, en Panell → Rebuts:

1. Pon la cuota de socio y el descuento por varias actividades en «Preus» (una sola vez, o cuando cambien).
2. Pulsa «Calcular els rebuts». Entran las familias socias **activas**: la cuota anual el mes en que se dieron
   de alta, y cada actividad con «rebut mensual» en la que un participante ha tenido plaza algún día del mes
   (mes completo; las pruebas no se cobran). El panel avisa de las familias con la ficha pendiente, que no
   entran hasta que se activan.
3. Copia cada recibo en CaixaBank (titular, IBAN, importe, concepto y referencia del mandato tienen botón de
   copiar) o descarga el Excel.
4. Cuando el banco los haya pasado, «Marcar tots els pendents com a cobrats». Un recibo devuelto se marca
   como «Retornat» y la familia lo ve así en su cuenta.

Volver a calcular un mes solo rehace los recibos pendientes. Cada familia ve sus recibos en El meu compte →
Rebuts, sin el IBAN completo.

### Actividades de prueba

Las actividades se crean desde el panel. `supabase/seed.sql` tiene ejemplos que solo se cargan en la base
de datos local.

### Supabase en local (opcional)

Con Docker instalado, `npx supabase start` levanta una copia local (API en `http://127.0.0.1:54321`, correos de
prueba en <http://127.0.0.1:54324>) y `npx supabase db reset` aplica las migraciones desde cero con los datos de ejemplo. Las claves
locales las muestra `npx supabase status`. Para ver los correos de la web en local, pon `SMTP_HOST=127.0.0.1` y
`SMTP_PORT=54325`.

### Comandos

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Compila para producción |
| `npm start` | Arranca la versión compilada |
| `npm run lint` | Revisa el código con ESLint |
| `npm run typecheck` | Comprueba los tipos de TypeScript |
| `npm test` | Pruebas unitarias (validación de DNI/IBAN, cifrado) |

## Estructura

```
src/
  app/[lang]/        Páginas; [lang] es ca o es
    activitats/      Listado y detalle de actividades, con la inscripción
    compte/          Cuenta: resumen, participantes, inscripciones, ficha de socio
    admin/           Panel de administración (solo admins con verificación en dos pasos)
  components/        Cabecera, pie, formularios…
  config/site.ts     Datos de contacto de la entidad
  i18n/              Idiomas y textos (dictionaries/ca.json, es.json)
  lib/actions/       Server Actions de los formularios (registro, participantes, socio…)
  lib/crypto.ts      Cifrado de DNI e IBAN
  lib/email.ts       Envío de correos por SMTP
  lib/supabase/      Clientes de Supabase para servidor, navegador y proxy
  proxy.ts           Redirige al idioma y refresca la sesión en cada petición
supabase/migrations/ Tablas y reglas de acceso (RLS)
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
- Los datos sensibles (DNI, IBAN, salud) se protegen en la base de datos con Row Level Security; DNI e IBAN además van cifrados.
- Cada cambio va en una rama y un pull request; la integración continua comprueba lint, tipos, pruebas y compilación.
