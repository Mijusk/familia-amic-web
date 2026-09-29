# Alcance de la V1

Resumen de las decisiones de negocio tomadas en septiembre de 2026 (tres rondas de preguntas sobre la
especificación funcional). Los Excels con cada pregunta y respuesta están en la carpeta compartida del
proyecto, no en este repositorio.

## Qué entra

| Módulo | Cómo queda |
| --- | --- |
| Idioma | Interfaz en catalán y castellano con selector. Actividades y noticias se publican en el idioma en que se escriben. |
| Inicio | Portada profesional: qué es Família Amic, próximas actividades, noticias, llamadas a apuntarse, voluntariado, hacerse socio y donar. |
| Associació | Qui som, junta, col·laboradors, drets del soci, transparència, canal de denúncies. |
| Recursos | Guías de Temes legals, Educació y Medicina de la web antigua, editables desde el panel. |
| Cuentas familiares | Registro con email y contraseña, verificación por email. Un titular adulto por familia que añade participantes (hijos, persona con discapacidad) con todos sus datos una sola vez. |
| Actividades | Recurrentes semanales con inscripción mensual (renovación automática opcional) y eventos puntuales. Precio socio / no socio y descuento configurable por varias actividades. |
| Inscripciones | Desde la cuenta: elegir actividad y participantes. Sin duplicados. Baja desde la cuenta con aviso por email a la asociación. |
| Lista de espera | Cola cuando se llena; un admin decide quién pasa. |
| Pagos | Sin pago online. Recibo mensual domiciliado por IBAN con orden SEPA aceptada en la web; cuota de socio 50 €/año; el panel exporta el Excel de recibos. Eventos puntuales por transferencia o efectivo. |
| Socios | Alta desde la cuenta: DNI, domicilio, banco, IBAN, datos de la persona con discapacidad. |
| Voluntariado | Cuenta de voluntario separada; su solicitud aparece en el panel. |
| Donaciones | IBAN y Bizum informativos. |
| Noticias | Con vínculo opcional a actividad. Se migran 10-15 de la web antigua. |
| Contacto | Formulario guardado en el panel y aviso por email. |
| Administración | Admins creados a mano que pueden crear otros (no borrarse entre sí), con verificación en dos pasos. Ven inscritos, cola, familias, socios, voluntarios y recibos. |
| Analítica | Sin cookies (tipo Plausible o Umami). |

## Qué queda fuera de la V1

Projectes, pago con tarjeta, tienda, entradas, lotería, QR, dashboards y roles avanzados.

## Datos sensibles

La web guarda DNI, IBAN y datos de salud (discapacidad, dependencia, alergias), que son categoría especial
según el RGPD. Por eso:

- Toda regla de acceso se aplica en la base de datos con Row Level Security, no solo en la interfaz.
- IBAN y DNI se guardan cifrados.
- Nunca se suben datos reales, exportaciones ni claves a este repositorio (es público).
- Antes del lanzamiento conviene una revisión de protección de datos y pasar Supabase al plan con copias de seguridad.

## Fases de construcción

0. Base: Next.js, Supabase, Vercel, idiomas, diseño visual.
1. Cuentas: registro, verificación, login, 2FA de admins, familia, participantes, ficha de socio.
2. Actividades: listado, detalle, inscripción, cola, baja, emails.
3. Panel: actividades, inscritos, cola, familias, voluntarios, admins.
4. Recibos: generar los del mes y exportar Excel.
5. Contenido: portada, Associació, noticias, recursos, contacto, voluntariado, legales, migración.
