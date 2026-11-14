import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { Archivo, NotaOperatoria } from "@/src/server/db/model";
import { firebaseBucket } from "@/src/server/storage/firebase";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { isValidObjectId } from "mongoose";
import { randomUUID } from "node:crypto";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const formData = await request.formData();
  const file = formData.get("archivo");
  const idNota = formData.get("idNota");

  if (!file || typeof file === "string") {
    return fail("El campo 'archivo' es obligatorio", 400);
  }
  if (typeof idNota !== "string" || !isValidObjectId(idNota)) {
    return fail("El campo 'idNota' es obligatorio y debe ser válido", 400);
  }

  const mimePorExtension: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    pdf: "application/pdf",
  };
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!mimePorExtension[extension] || file.type !== mimePorExtension[extension]) {
    return fail("Solo se permiten archivos PNG, JPEG, WEBP y PDF", 400);
  }

  await connectDB();
  const nota = await NotaOperatoria.findById(idNota).select("_id");
  if (!nota) return fail("Nota operatoria no encontrada", 404);

  const buffer = Buffer.from(await file.arrayBuffer());
  const nombreOriginal = file.name || "archivo";
  const nombreSeguro = nombreOriginal.replace(/[^\w.-]/g, "_");
  const rutaStorage = `notas/${idNota}/${randomUUID()}-${nombreSeguro}`;
  const bucket = firebaseBucket();
  const objeto = bucket.file(rutaStorage);
  try {
    await objeto.save(buffer, {
      resumable: false,
      metadata: {
        contentType: file.type,
      },
    });

    const registro = new Archivo({
      idNota,
      nombreArchivo: nombreOriginal,
      formatoArchivo: file.type,
      storagePath: rutaStorage,
    });

    registro.url = `/api/archivos/${registro._id}`;
    await registro.save();

    return ok(registro.toObject());
  } catch (error) {
    await objeto.delete().catch(() => undefined);
    throw error;
  }
}
