import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { isValidObjectId } from "mongoose";
import { notaOperatoriaBodySchema } from "@/src/server/validation/requestSchemas";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const raw = await request.json().catch(() => null);
  const parsed = notaOperatoriaBodySchema.safeParse(raw);
  if (!parsed.success) {
    const campos = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0] ?? "body"), issue.message]),
    );
    return Response.json(
      { ok: false, error: "Revisa los campos marcados.", campos },
      { status: 422 },
    );
  }
  const body = parsed.data;

  await connectDB();

  const expedienteExiste = await ExpedienteMedico.exists({ _id: body.idExpediente });
  if (!expedienteExiste) return fail("Expediente no encontrado", 404);

  const nota = await NotaOperatoria.create({
    ...body,
    fechaCirugia: new Date(`${body.fechaCirugia}T00:00:00Z`),
  });

  return ok(nota);
}
