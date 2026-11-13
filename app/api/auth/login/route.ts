import { NextRequest } from "next/server";
import { connectDB } from "@/src/server";
import { Cirujano } from "@/src/server/db/model";
import { verifyPassword } from "@/src/server/auth/password";
import {
  createSessionToken,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from "@/src/server/auth/session";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { loginBodySchema } from "@/src/server/validation/requestSchemas";

export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);
  const parsed = loginBodySchema.safeParse(raw);
  if (!parsed.success) return fail("Cuerpo de inicio de sesión inválido", 400);
  const { nombreUsuario, contraseña } = parsed.data;

  await connectDB();

  const cirujano = await Cirujano.findOne({ nombreUsuario }).lean();
  if (!cirujano) {
    return fail("Credenciales inválidas", 401);
  }

  const coincide = await verifyPassword(contraseña, String(cirujano.contraseña));
  if (!coincide) {
    return fail("Credenciales inválidas", 401);
  }

  const token = await createSessionToken({
    id: String(cirujano._id),
    usuario: cirujano.nombreUsuario,
  });

  const response = ok({ usuario: cirujano.nombreUsuario });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });

  return response;
}
