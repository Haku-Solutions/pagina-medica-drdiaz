import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico } from "@/src/server/db/model";
import { created, fail, ok } from "@/src/server/utils/apiResponse";
import {
  escapeRegex,
  normalizarPaciente,
} from "@/src/server/services/pacientes";

const POR_PAGINA_DEFECTO = 10;

/**
 * GET /api/pacientes
 * Lista los pacientes (expedientes) del cirujano con sesión abierta.
 * Query: `busqueda`, `pagina`, `porPagina`.
 */
export async function GET(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const { searchParams } = new URL(request.url);
  const busqueda = (searchParams.get("busqueda") ?? "").trim();
  const porPagina = Math.max(
    1,
    Number(searchParams.get("porPagina")) || POR_PAGINA_DEFECTO
  );
  const paginaSolicitada = Math.max(1, Number(searchParams.get("pagina")) || 1);

  const filtro = busqueda
    ? {
        idCirujano: session.id,
        $or: [
          { nombreCompleto: new RegExp(escapeRegex(busqueda), "i") },
          { curp: new RegExp(escapeRegex(busqueda), "i") },
        ],
      }
    : { idCirujano: session.id };

  const total = await ExpedienteMedico.countDocuments(filtro);
  const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
  const pagina = Math.min(paginaSolicitada, totalPaginas);

  const pacientes = await ExpedienteMedico.find(filtro)
    .sort({ createdAt: -1 })
    .skip((pagina - 1) * porPagina)
    .limit(porPagina)
    .lean();

  return ok({ pacientes, total, pagina, totalPaginas, porPagina });
}

/** POST /api/pacientes — crea un expediente para el cirujano con sesión. */
export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return fail("Cuerpo inválido", 400);
  }

  const { datos, error } = normalizarPaciente(
    body as Record<string, unknown>,
    { requerirNombre: true }
  );
  if (error) return fail(error, 400);

  const paciente = await ExpedienteMedico.create({
    idCirujano: session.id,
    ...datos,
  });

  return created(paciente);
}
