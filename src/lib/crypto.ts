import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

/**
 * Cifrado AES-256-GCM para DNI e IBAN antes de guardarlos en la base de datos.
 * La clave (32 bytes en base64) vive solo en el servidor: DATA_ENCRYPTION_KEY.
 * Formato guardado: v1.<iv>.<tag>.<texto cifrado>, todo en base64url.
 */
function getKey() {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw) throw new Error("Falta DATA_ENCRYPTION_KEY en las variables de entorno");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("DATA_ENCRYPTION_KEY debe ser de 32 bytes en base64");
  return key;
}

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv, tag, data].map((p) => (typeof p === "string" ? p : p.toString("base64url"))).join(".");
}

export function decrypt(stored: string): string {
  const [version, iv, tag, data] = stored.split(".");
  if (version !== "v1" || !iv || !tag || !data) throw new Error("Formato cifrado desconocido");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(data, "base64url")), decipher.final()]).toString("utf8");
}
