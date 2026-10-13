import { getSessionUser } from "@/src/server/auth/requireSession";
import { fail, ok } from "@/src/server/utils/apiResponse";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return fail("No hay sesión activa", 401);
  }
  return ok({ usuario: session.usuario });
}
