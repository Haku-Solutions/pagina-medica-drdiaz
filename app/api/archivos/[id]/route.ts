import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { Archivo } from "@/src/server/db/model";
import { firebaseBucket } from "@/src/server/storage/firebase";
import { fail, ok } from "@/src/server/utils/apiResponse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return fail("ID de archivo inválido", 400);

  await connectDB();
  const archivo = await Archivo.findById(id).lean();
  if (!archivo) return fail("Archivo no encontrado", 404);

  const bucket = firebaseBucket();
  const ubicacion = archivo.storagePath
    ? { bucket: bucket.name, path: archivo.storagePath }
    : obtenerRutaStorage(archivo.url);
  if (!ubicacion || ubicacion.bucket !== bucket.name) {
    return fail("No se pudo identificar el archivo en Firebase Storage", 409);
  }

  const [buffer] = await bucket.file(ubicacion.path).download();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": archivo.formatoArchivo || "application/octet-stream",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(archivo.nombreArchivo)}`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function obtenerRutaStorage(url: string) {
  if (url.startsWith("gs://")) {
    const match = url.match(/^gs:\/\/([^/]+)\/(.+)$/);
    return match ? { bucket: match[1], path: match[2] } : null;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "firebasestorage.googleapis.com") return null;
    const match = parsed.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
    return match
      ? { bucket: match[1], path: decodeURIComponent(match[2]) }
      : null;
  } catch {
    return null;
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return fail("ID de archivo inválido", 400);

  await connectDB();
  const archivo = await Archivo.findById(id).lean();
  if (!archivo) return fail("Archivo no encontrado", 404);

  const bucket = firebaseBucket();
  const ubicacion = archivo.storagePath
    ? { bucket: bucket.name, path: archivo.storagePath }
    : obtenerRutaStorage(archivo.url);

  if (!ubicacion || ubicacion.bucket !== bucket.name) {
    return fail("No se pudo identificar el archivo en Firebase Storage", 409);
  }

  await bucket.file(ubicacion.path).delete({ ignoreNotFound: true });
  await Archivo.findByIdAndDelete(id);

  return ok({ eliminado: true });
}
