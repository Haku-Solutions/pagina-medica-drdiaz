import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, Cirujano } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";

export async function GET(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  const filter = query
    ? {
        $or: [
          { nombreCompleto: { $regex: query, $options: "i" } },
          { curp: { $regex: query, $options: "i" } },
        ],
      }
    : {};

  const expedientes = await ExpedienteMedico.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return ok(expedientes);
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const body = await request.json().catch(() => null);
  if (!body) return fail("Cuerpo inválido", 400);

  const cirujano = await Cirujano.findOneAndUpdate(
    { nombreUsuario: session.usuario },
    { $setOnInsert: { nombreUsuario: session.usuario, contraseña: "" } },
    { upsert: true, returnDocument: "after" }
  );

  const expediente = await ExpedienteMedico.create({
    idCirujano: cirujano._id,
    ...body,
  });

  return ok(expediente);
}
