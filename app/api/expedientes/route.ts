import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, Cirujano } from "@/src/server/db/model";
import { created, fail, ok } from "@/src/server/utils/apiResponse";

const escaparRegex = (texto: string) =>
  texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const texto = (valor: unknown, max: number) =>
  typeof valor === "string" ? valor.trim().slice(0, max) : "";

const opcional = (valor: unknown, max: number) => texto(valor, max) || undefined;

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
  if (!raw || typeof raw !== "object") return fail("Cuerpo inválido", 400);

  const body = raw as Record<string, unknown>;

  const nombre = texto(body.nombre, 200);
  const fechaNacimiento = texto(body.fechaNacimiento, 10);
  const sexo = texto(body.sexo, 10);
  const curp = texto(body.curp, 40).toUpperCase();
  const telefono = texto(body.telefono, 20);
  const familiarTelefono = texto(body.familiarTelefono, 20);

  const errores: Record<string, string> = {};

  if (!nombre) errores.nombre = "Escribe el nombre completo del paciente.";
  if (fechaNacimiento && !fechaValida(fechaNacimiento)) {
    errores.fechaNacimiento = "La fecha de nacimiento no es válida.";
  }
  if (!["", "hombre", "mujer"].includes(sexo)) {
    errores.sexo = "Selecciona una opción válida.";
  }
  if (curp && !/^[A-Z0-9]{18}$/.test(curp)) {
    errores.curp = "El CURP debe tener 18 caracteres.";
  }
  if (telefono && !/^\d{10}$/.test(telefono)) {
    errores.telefono = "El teléfono debe tener 10 dígitos.";
  }
  if (familiarTelefono && !/^\d{10}$/.test(familiarTelefono)) {
    errores.familiarTelefono = "El teléfono debe tener 10 dígitos.";
  }

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
      antecedentes: opcional(body.antecedentes, 5000),
      estado: opcional(body.estadoNacimiento, 120),
      municipio: opcional(body.ciudadNacimiento, 120),
      curp: curp || undefined,
      lugarResidencia: opcional(body.residencia, 160),
      telefono: telefono ? Number(telefono) : undefined,
      familiarResponsable: opcional(body.familiarNombre, 200),
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