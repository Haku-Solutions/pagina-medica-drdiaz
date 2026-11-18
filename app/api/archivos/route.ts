import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { Archivo, ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { firebaseBucket } from "@/src/server/storage/firebase";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { ImageUploadError, MAX_UPLOAD_BYTES, processUploadedImage } from "@/src/server/storage/processUploadedImage";
import { isValidObjectId } from "mongoose";
import { randomUUID } from "node:crypto";

const mimePorExtension: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

const MAX_REQUEST_BODY_BYTES = 4.5 * 1024 * 1024;

async function obtenerNotaPropia(idNota: string, idCirujano: string) {
  const nota = await NotaOperatoria.findById(idNota).select("_id idExpediente");
  if (!nota) return null;
  const expediente = await ExpedienteMedico.exists({
    _id: nota.idExpediente,
    idCirujano,
  });
  return expediente ? nota : null;
}

async function guardarImagen(request: NextRequest, sessionId: string) {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BODY_BYTES) {
    return fail("La solicitud supera el límite de 4.5 MB.", 413);
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return fail("No se pudo leer el archivo enviado.", 400);
  }
  const file = formData.get("archivo");
  const idNota = formData.get("idNota");
  const nombre = formData.get("nombreArchivo");
  if (!(file instanceof File) || typeof idNota !== "string" || !isValidObjectId(idNota)) {
    return fail("El archivo y una nota válida son obligatorios.", 400);
  }
  if (file.size === 0 || file.size > MAX_UPLOAD_BYTES) {
    return fail("La imagen supera el límite de 4 MB.", 413);
  }
  const nombreOriginal = typeof nombre === "string" ? nombre : file.name;
  if (nombreOriginal.length < 1 || nombreOriginal.length > 255) {
    return fail("El nombre del archivo no es válido.", 400);
  }

  await connectDB();
  const nota = await obtenerNotaPropia(idNota, sessionId);
  if (!nota) return fail("Nota operatoria no encontrada.", 404);

  let procesada: Awaited<ReturnType<typeof processUploadedImage>>;
  try {
    procesada = await processUploadedImage(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    if (error instanceof ImageUploadError) return fail(error.message, error.status);
    throw error;
  }

  const storagePath = `notas/${idNota}/${randomUUID()}-imagen.webp`;
  const objeto = firebaseBucket().file(storagePath);
  try {
    await objeto.save(procesada.buffer, {
      resumable: false,
      metadata: { contentType: procesada.contentType },
    });
    const registro = new Archivo({
      idNota,
      nombreArchivo: nombreOriginal,
      formatoArchivo: procesada.contentType,
      storagePath,
      url: "",
    });
    registro.url = `/api/archivos/${registro._id}`;
    await registro.save();
    return ok(registro.toObject());
  } catch (error) {
    await objeto.delete({ ignoreNotFound: true }).catch(() => undefined);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  if (request.headers.get("content-type")?.includes("multipart/form-data")) {
    return guardarImagen(request, session.id);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Solicitud inválida", 400);

  if (body.accion === "iniciar") {
    const { idNota, nombre, tipo } = body;
    if (typeof idNota !== "string" || !isValidObjectId(idNota)) {
      return fail("El identificador de la nota no es válido", 400);
    }
    if (typeof nombre !== "string" || nombre.length < 1 || nombre.length > 255 || typeof tipo !== "string") {
      return fail("Los datos del archivo no son válidos", 400);
    }
    const extension = nombre.split(".").pop()?.toLowerCase() ?? "";
    if (!mimePorExtension[extension] || tipo !== mimePorExtension[extension]) {
      return fail("Solo se permiten imágenes PNG, JPEG y WEBP", 400);
    }

    await connectDB();
    const nota = await obtenerNotaPropia(idNota, session.id);
    if (!nota) return fail("Nota operatoria no encontrada", 404);

    const nombreSeguro = nombre.replace(/[^\w.-]/g, "_");
    const storagePath = `notas/${idNota}/${randomUUID()}-${nombreSeguro}`;
    const [uploadUrl] = await firebaseBucket().file(storagePath).getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 10 * 60 * 1000,
      contentType: tipo,
    });
    return ok({ uploadUrl, storagePath });
  }

  if (body.accion === "confirmar") {
    const { idNota, nombre, tipo, storagePath } = body;
    if (
      typeof idNota !== "string" || !isValidObjectId(idNota) ||
      typeof nombre !== "string" || typeof tipo !== "string" ||
      typeof storagePath !== "string" || !storagePath.startsWith(`notas/${idNota}/`)
    ) return fail("Los datos del archivo no son válidos", 400);

    const extension = nombre.split(".").pop()?.toLowerCase() ?? "";
    if (!mimePorExtension[extension] || tipo !== mimePorExtension[extension]) {
      return fail("Solo se permiten imágenes PNG, JPEG y WEBP", 400);
    }

    await connectDB();
    const nota = await obtenerNotaPropia(idNota, session.id);
    if (!nota) return fail("Nota operatoria no encontrada", 404);

    const objeto = firebaseBucket().file(storagePath);
    const [existe] = await objeto.exists();
    if (!existe) return fail("No se encontró el archivo cargado en Firebase", 404);
    const [metadata] = await objeto.getMetadata();
    if (Number(metadata.size) > MAX_UPLOAD_BYTES) {
      await objeto.delete({ ignoreNotFound: true });
      return fail("La imagen supera el límite de 4 MB.", 413);
    }

    try {
      const [uploadedBuffer] = await objeto.download();
      const procesada = await processUploadedImage(uploadedBuffer);
      await objeto.save(procesada.buffer, {
        resumable: false,
        metadata: { contentType: procesada.contentType },
      });
      const registro = new Archivo({
        idNota,
        nombreArchivo: nombre,
        formatoArchivo: procesada.contentType,
        storagePath,
        url: "",
      });
      registro.url = `/api/archivos/${registro._id}`;
      await registro.save();
      return ok(registro.toObject());
    } catch (error) {
      await objeto.delete({ ignoreNotFound: true }).catch(() => undefined);
      if (error instanceof ImageUploadError) return fail(error.message, error.status);
      throw error;
    }
  }

  return fail("Acción de carga no válida", 400);
}
