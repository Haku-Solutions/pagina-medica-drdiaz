import { NextRequest } from "next/server";
import { env } from "@/src/server/config/env";
import { verifyPassword } from "@/src/server/auth/password";
import {
  createSessionToken,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from "@/src/server/auth/session";
import { fail, ok } from "@/src/server/utils/apiResponse";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const usuario = typeof body?.usuario === "string" ? body.usuario.trim() : "";
  const contraseña = typeof body?.contraseña === "string" ? body.contraseña : "";

  if (!usuario || !contraseña) {
    return fail("Faltan credenciales", 400);
  }

  const configuredUser = env.ADMIN_USERNAME();
  const configuredHash = env.ADMIN_PASSWORD_HASH();

  const credencialesValidas =
    usuario === configuredUser &&
    Boolean(configuredHash) &&
    (await verifyPassword(contraseña, configuredHash));

  if (!credencialesValidas) {
    return fail("Credenciales inválidas", 401);
  }

  const token = await createSessionToken(usuario);

  const response = ok({ usuario });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return response;
}
