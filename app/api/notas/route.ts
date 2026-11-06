import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { isValidObjectId } from "mongoose";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const body = await request.json().catch(() => null);
  if (!body) return fail("Cuerpo inválido", 400);

  if (typeof body.idExpediente !== "string" || !isValidObjectId(body.idExpediente)) {
    return fail("El ID del expediente no es válido", 400);
  }

  const expedienteExiste = await ExpedienteMedico.exists({ _id: body.idExpediente });
  if (!expedienteExiste) return fail("Expediente no encontrado", 404);

  const nota = await NotaOperatoria.create(body);

  return ok(nota);
}
