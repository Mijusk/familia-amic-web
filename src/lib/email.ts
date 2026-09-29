import "server-only";
import nodemailer from "nodemailer";
import { site } from "@/config/site";

/**
 * Correos de la web (inscripciones, bajas, mensajes de contacto). Se envían por SMTP: en producción el Gmail de la entidad con una
 * contraseña de aplicación; en local, el Mailpit de Supabase (puerto 54325). Sin SMTP_HOST solo se registran
 * en la consola, y un fallo al enviar nunca rompe la inscripción.
 */
function transport() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

/** Adónde llegan los avisos para la asociación. */
export const associationEmail = process.env.ASSOCIATION_EMAIL || site.email;

export async function sendEmail({ to, subject, text, replyTo }: { to: string; subject: string; text: string; replyTo?: string }) {
  const t = transport();
  if (!t) {
    console.info(`[email sin SMTP] Para: ${to} · ${subject}`);
    return false;
  }
  try {
    await t.sendMail({ from: process.env.MAIL_FROM || `${site.name} <${site.email}>`, to, subject, text, replyTo });
    return true;
  } catch (error) {
    console.error("[email] No se pudo enviar", subject, error);
    return false;
  }
}
