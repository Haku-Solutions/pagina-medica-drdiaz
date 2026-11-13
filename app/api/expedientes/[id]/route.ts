import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { isValidObjectId } from "mongoose";
import { NextResponse } from "next/server";
import { expedienteBodySchema } from "@/src/server/validation/requestSchemas";

function calcularEdadPut(fechaNacimiento: string): number | undefined {
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


export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  const { id } = await params;
  if (!isValidObjectId(id)) return fail("ID inválido", 400);

  await connectDB();

  const expediente = await ExpedienteMedico.findById(id).lean();
  if (!expediente) return fail("Expediente no encontrado", 404);

  const notas = await NotaOperatoria.find({ idExpediente: id })
    .sort({ fechaCirugia: -1 })
    .lean();

  return ok({ expediente, notas });
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);
 
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return fail("Expediente no encontrado", 404);
 
  const raw = await request.json().catch(() => null);
  const parsed = expedienteBodySchema.safeParse(raw);
  if (!parsed.success) {
    const campos: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const campo = String(issue.path[0] ?? "body");
      const requerido = campo === "nombre" && issue.code === "too_small";
      const mensaje = requerido
        ? "Escribe el nombre completo del paciente."
        : campo === "fechaNacimiento"
          ? "La fecha de nacimiento no es válida; usa una fecha real que no sea futura."
          : campo === "sexo"
            ? "Selecciona Hombre o Mujer."
            : campo === "curp"
              ? "El CURP debe tener 18 letras o números, o dejarse vacío."
              : campo === "telefono" || campo === "familiarTelefono"
                ? "El teléfono debe tener exactamente 10 dígitos, o dejarse vacío."
                : issue.message;
      campos[campo] ??= mensaje;
    }
    return NextResponse.json(
      { ok: false, error: "Revisa los campos marcados; cada campo indica cómo corregirlo.", campos },
      { status: 422 },
    );
  }

  const body = parsed.data;
  const { nombre, fechaNacimiento, sexo, curp, telefono, familiarTelefono } = body;
  try {
    await connectDB();
 
    // El CURP no puede repetirse en OTRO expediente (el propio sí puede conservarlo).
    if (curp && (await ExpedienteMedico.exists({ curp, _id: { $ne: id } }))) {
      return Response.json(
        {
          ok: false,
          error: "Ya existe un expediente con ese CURP.",
          campos: { curp: "Ya existe un expediente con ese CURP." },
        },
        { status: 409 },
      );
    }
 
    // Solo se actualizan los campos permitidos. idCirujano y createdAt no se tocan.
    const valores: Record<string, unknown> = {
      nombreCompleto: nombre,
      fechaNacimiento: fechaNacimiento
        ? new Date(`${fechaNacimiento}T00:00:00Z`)
        : undefined,
      edad: calcularEdadPut(fechaNacimiento),
      sexo: sexo === "hombre" ? "M" : sexo === "mujer" ? "F" : undefined,
      antecedentes: body.antecedentes || undefined,
      estado: body.estadoNacimiento || undefined,
      municipio: body.ciudadNacimiento || undefined,
      curp: curp || undefined,
      lugarResidencia: body.residencia || undefined,
      telefono: telefono ? Number(telefono) : undefined,
      familiarResponsable: body.familiarNombre || undefined,
      telefonoFamiliar: familiarTelefono ? Number(familiarTelefono) : undefined,
    };
 
    // Un campo vacío se borra del documento ($unset) en lugar de quedar en blanco.
    const set: Record<string, unknown> = {};
    const unset: Record<string, 1> = {};
 
    for (const [campo, valor] of Object.entries(valores)) {
      if (valor === undefined) unset[campo] = 1;
      else set[campo] = valor;
    }
 
    const expediente = await ExpedienteMedico.findByIdAndUpdate(
      id,
      { $set: set, $unset: unset },
      { returnDocument: "after", runValidators: true },
    ).lean();
 
    if (!expediente) return fail("Expediente no encontrado", 404);
 
    return ok(expediente);
  } catch (err) {
    // No se registra el cuerpo: contiene datos de pacientes.
    console.error(
      "Error al actualizar expediente:",
      err instanceof Error ? err.message : err,
    );
    return fail("No se pudieron guardar los cambios. Intenta de nuevo.", 500);
  }
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

  const expediente = await ExpedienteMedico.findByIdAndDelete(id);
  if (!expediente) return fail("Expediente no encontrado", 404);

  return ok({ eliminado: true });
}
