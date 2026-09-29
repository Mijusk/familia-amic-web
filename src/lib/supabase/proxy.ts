import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Refresca la sesión de Supabase en cada petición y copia las cookies
 * actualizadas a la respuesta. Si Supabase no está configurado, no hace nada.
 */
export async function updateSession(request: NextRequest, response: NextResponse) {
  const env = getSupabaseEnv();
  if (!env) return response;

  const supabase = createServerClient(env.url, env.key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          response.cookies.set(name, value, options);
        });
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // No quitar: valida el token y lo renueva si ha caducado.
  await supabase.auth.getClaims();

  return response;
}
