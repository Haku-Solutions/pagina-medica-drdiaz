import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { normalizarPaciente } from "@/src/server/services/pacientes";

/** GET /api/pacientes/[id] — paciente + sus notas operatorias. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return fail("ID inválido", 400);

  await connectDB();

  const paciente = await ExpedienteMedico.findOne({
    _id: id,
    idCirujano: session.id,
  }).lean();
  if (!paciente) return fail("Paciente no encontrado", 404);

  const notas = await NotaOperatoria.find({ idExpediente: id })
    .sort({ fechaCirugia: -1 })
    .lean();

  return ok({ paciente, notas });
}

/** PUT /api/pacientes/[id] — actualiza solo los campos enviados. */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return fail("ID inválido", 400);

  await connectDB();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("Cuerpo inválido", 400);
  }

  const { datos, error } = normalizarPaciente(body as Record<string, unknown>);
  if (error) return fail(error, 400);

  const paciente = await ExpedienteMedico.findOneAndUpdate(
    { _id: id, idCirujano: session.id },
    { $set: datos },
    { new: true, runValidators: true }
  ).lean();
  if (!paciente) return fail("Paciente no encontrado", 404);

  return ok(paciente);
}

/** DELETE /api/pacientes/[id] — elimina el expediente del paciente. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return fail("ID inválido", 400);

  await connectDB();

  const paciente = await ExpedienteMedico.findOneAndDelete({
    _id: id,
    idCirujano: session.id,
  });
  if (!paciente) return fail("Paciente no encontrado", 404);

  return ok({ eliminado: true });
}
