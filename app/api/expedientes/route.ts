import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, Cirujano } from "@/src/server/db/model";
import { created, fail, ok } from "@/src/server/utils/apiResponse";
import { expedienteBodySchema } from "@/src/server/validation/requestSchemas";

const escaparRegex = (texto: string) =>
  texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function fechaValida(valor: string) {
  const fecha = new Date(`${valor}T00:00:00Z`);

  return (
    /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().startsWith(valor) &&
    fecha.getTime() <= Date.now()
  );
}

// La edad se calcula en el servidor; no se confía en la del navegador.
function calcularEdad(fechaNacimiento: string): number | undefined {
  if (!fechaNacimiento) return undefined;

  const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
  const hoy = new Date();
  let edad = hoy.getFullYear() - anio;

  const mesActual = hoy.getMonth() + 1;
  if (mesActual < mes || (mesActual === mes && hoy.getDate() < dia)) {
    edad -= 1;
  }

  return edad >= 0 ? edad : undefined;
}

export async function GET(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const query = (request.nextUrl.searchParams.get("query")?.trim() ?? "").slice(
    0,
    100,
  );

  // Se escapa el texto buscado para que no se interprete como expresión regular.
  const buscado = escaparRegex(query);
  const filter = query
    ? {
        $or: [
          { nombreCompleto: { $regex: buscado, $options: "i" } },
          { curp: { $regex: buscado, $options: "i" } },
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

  const raw = await request.json().catch(() => null);
  const parsed = expedienteBodySchema.safeParse(raw);
  if (!parsed.success) {
    const campos = Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] ?? "body"), issue.message]));
    return NextResponse.json({ ok: false, error: "Revisa los campos marcados.", campos }, { status: 422 });
  }
  const body = parsed.data;
  const nombre = body.nombre;
  const fechaNacimiento = body.fechaNacimiento;
  const sexo = body.sexo;
  const curp = body.curp;
  const telefono = body.telefono;
  const familiarTelefono = body.familiarTelefono;

  const errores: Record<string, string> = {};

  if (!nombre) errores.nombre = "Escribe el nombre completo del paciente.";
  if (Object.keys(errores).length > 0) {
    return NextResponse.json(
      { ok: false, error: "Revisa los campos marcados.", campos: errores },
      { status: 422 },
    );
  }

  try {
    await connectDB();

    if (curp && (await ExpedienteMedico.exists({ curp }))) {
      return NextResponse.json(
        {
          ok: false,
          error: "Ya existe un expediente con ese CURP.",
          campos: { curp: "Ya existe un expediente con ese CURP." },
        },
        { status: 409 },
      );
    }

    const cirujano = await Cirujano.findOneAndUpdate(
      { nombreUsuario: session.usuario },
      { $setOnInsert: { nombreUsuario: session.usuario, contraseña: "" } },
      { upsert: true, returnDocument: "after" },
    );

    // Solo se guardan los campos permitidos; el cuerpo de la petición
    // nunca se copia tal cual (así no se puede cambiar idCirujano, etc.).
    const expediente = await ExpedienteMedico.create({
      idCirujano: cirujano._id,
      nombreCompleto: nombre,
      fechaNacimiento: fechaNacimiento
        ? new Date(`${fechaNacimiento}T00:00:00Z`)
        : undefined,
      edad: calcularEdad(fechaNacimiento),
      sexo: sexo === "hombre" ? "M" : sexo === "mujer" ? "F" : undefined,
      antecedentes: body.antecedentes || undefined,
      estado: body.estadoNacimiento || undefined,
      municipio: body.ciudadNacimiento || undefined,
      curp: curp || undefined,
      lugarResidencia: body.residencia || undefined,
      telefono: telefono ? Number(telefono) : undefined,
      familiarResponsable: body.familiarNombre || undefined,
      telefonoFamiliar: familiarTelefono ? Number(familiarTelefono) : undefined,
    });

    return created(expediente);
  } catch (err) {
    // No se registra el cuerpo: contiene datos de pacientes.
    console.error(
      "Error al crear expediente:",
      err instanceof Error ? err.message : err,
    );
    return fail("No se pudo crear el expediente. Intenta de nuevo.", 500);
  }
}
