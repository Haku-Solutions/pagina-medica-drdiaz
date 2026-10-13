import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { NotaOperatoria, Archivo } from "@/src/server/db/model";
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

  const nota = await NotaOperatoria.findById(id).lean();
  if (!nota) return fail("Nota operatoria no encontrada", 404);

  const archivos = await Archivo.find({ idNota: id }).lean();

  return ok({ nota, archivos });
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

  const nota = await NotaOperatoria.findByIdAndUpdate(
    id,
    { $set: body },
    { new: true, runValidators: true }
  ).lean();

  if (!nota) return fail("Nota operatoria no encontrada", 404);

  return ok(nota);
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

  const nota = await NotaOperatoria.findByIdAndDelete(id);
  if (!nota) return fail("Nota operatoria no encontrada", 404);

  await Archivo.deleteMany({ idNota: id });

  return ok({ eliminado: true });
}