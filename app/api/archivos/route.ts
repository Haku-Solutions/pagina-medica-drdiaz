import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { fail, ok } from "@/src/server/utils/apiResponse";

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const formData = await request.formData();
  const file = formData.get("archivo");

  if (!file || typeof file === "string") {
    return fail("El campo 'archivo' es obligatorio", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const archivo = {
    nombre: typeof file === "object" && "name" in file ? file.name : "archivo",
    formato: file.type || "application/octet-stream",
    tamanio: buffer.byteLength,
  };

  return ok({ recibido: archivo });
}
