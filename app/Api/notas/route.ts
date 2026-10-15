import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const body = await request.json().catch(() => null);
  if (!body) return fail("Cuerpo inválido", 400);

  const nota = await NotaOperatoria.create(body);

  return ok(nota);
}
