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
| Actividades | Recurrentes semanales con inscripción mensual (renovación automática opcional) y eventos puntuales. Precios y descuento por varias actividades editables desde el panel (pendientes de la lista nueva de la junta). |
| Inscripciones | Desde la cuenta: elegir actividad y participantes. Sin duplicados. Hay que ser socio (basta con haber enviado la ficha, aunque la asociación aún no la haya validado), pero cada participante puede hacer una sesión de prueba gratis sin serlo, eligiendo el día. Baja desde la cuenta con aviso por email a la asociación; una baja a mitad de mes cuenta desde el mes siguiente, y "solo este mes" termina a final de mes. |
| Lista de espera | Cola cuando se llena; un admin decide quién pasa. |
| Pagos | Sin pago online. Recibo mensual domiciliado por IBAN con orden SEPA aceptada en la web. Los recibos se meten a mano en el banco: el panel da la lista para copiarlos y el Excel. La familia ve sus recibos en su cuenta. Eventos puntuales por Bizum, transferencia o efectivo. |
| Socios | El socio es la familia: una cuota anual por familia, cobrada el mes de su alta. Alta desde la cuenta con DNI, domicilio, banco, IBAN y orden SEPA; queda pendiente hasta que un admin la activa. Los participantes también tienen DNI. |
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
1. Cuentas: registro, verificación, login, recuperar contraseña, familia, participantes, ficha de socio.
2. Actividades: listado, detalle, inscripción, cola, baja, emails.
3. Panel: actividades, inscritos, cola, familias, activar socios, admins con 2FA, registro de acciones.
4. Recibos: generar los del mes y exportar Excel.
5. Contenido: portada, Associació, noticias, recursos, contacto, voluntariado (formulario y su lista en el panel), fotos de actividades, legales, migración.
