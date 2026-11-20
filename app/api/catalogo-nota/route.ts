import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { Cirugias } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";

const clave = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("es");

export async function GET() {
  if (!await getSessionUser()) return fail("No autorizado", 401);
  await connectDB();
  const items = await Cirugias.find().sort({ valor: 1 }).lean();
  return ok(items);
}

export async function POST(request: NextRequest) {
  if (!await getSessionUser()) return fail("No autorizado", 401);
  const body = await request.json().catch(() => null);
  if (!body || !["cirugia", "lugar"].includes(body.tipo) || typeof body.valor !== "string") return fail("Datos inválidos", 422);
  const valor = body.valor.trim().replace(/\s+/g, " ");
  if (!valor || valor.length > 1500 || /[<>\u0000-\u001f]/u.test(valor)) return fail("Escribe un valor válido (máximo 1500 caracteres).", 422);
  await connectDB();
  const item = await Cirugias.findOneAndUpdate(
    { tipo: body.tipo, clave: clave(valor) },
    { $setOnInsert: { tipo: body.tipo, valor, clave: clave(valor) } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  return ok(item);
}

export async function DELETE(request: NextRequest) {
  if (!await getSessionUser()) return fail("No autorizado", 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body.id !== "string" || !isValidObjectId(body.id)) return fail("Opción inválida", 422);
  await connectDB();
  const deleted = await Cirugias.findByIdAndDelete(body.id);
  if (!deleted) return fail("La opción ya no existe", 404);
  return ok({ eliminado: true });
}
