import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { isValidObjectId } from "mongoose";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return fail("ID inválido", 400);

  await connectDB();

  const expediente = await ExpedienteMedico.findById(id).lean();
  if (!expediente) return fail("Expediente no encontrado", 404);

  const notas = await NotaOperatoria.find({ idExpediente: id })
    .sort({ fechaCirugia: -1 })
    .lean();

  return ok({ expediente, notas });
}

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
  if (!body) return fail("Cuerpo inválido", 400);

  const expediente = await ExpedienteMedico.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true }
  ).lean();

  if (!expediente) return fail("Expediente no encontrado", 404);

  return ok(expediente);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return fail("ID inválido", 400);

  await connectDB();

  const expediente = await ExpedienteMedico.findByIdAndDelete(id);
  if (!expediente) return fail("Expediente no encontrado", 404);

  return ok({ eliminado: true });
}