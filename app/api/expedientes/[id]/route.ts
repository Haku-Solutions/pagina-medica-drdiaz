import { NextRequest } from "next/server";
import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";
import { isValidObjectId } from "mongoose";

const textoPut = (valor: unknown, max: number) =>
  typeof valor === "string" ? valor.trim().slice(0, max) : "";
 
function fechaValidaPut(valor: string) {
  const fecha = new Date(`${valor}T00:00:00Z`);
 
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(valor) &&
    !Number.isNaN(fecha.getTime()) &&
    fecha.toISOString().startsWith(valor) &&
    fecha.getTime() <= Date.now()
  );
}
  
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
  if (!raw || typeof raw !== "object") return fail("Cuerpo inválido", 400);
 
  const body = raw as Record<string, unknown>;
 
  const nombre = textoPut(body.nombre, 200);
  const fechaNacimiento = textoPut(body.fechaNacimiento, 10);
  const sexo = textoPut(body.sexo, 10);
  const curp = textoPut(body.curp, 40).toUpperCase();
  const telefono = textoPut(body.telefono, 20);
  const familiarTelefono = textoPut(body.familiarTelefono, 20);
 
  const errores: Record<string, string> = {};
 
  if (!nombre) errores.nombre = "Escribe el nombre completo del paciente.";
  if (fechaNacimiento && !fechaValidaPut(fechaNacimiento)) {
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
    return Response.json(
      { ok: false, error: "Revisa los campos marcados.", campos: errores },
      { status: 422 },
    );
  }
 
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
      antecedentes: textoPut(body.antecedentes, 5000) || undefined,
      estado: textoPut(body.estadoNacimiento, 120) || undefined,
      municipio: textoPut(body.ciudadNacimiento, 120) || undefined,
      curp: curp || undefined,
      lugarResidencia: textoPut(body.residencia, 160) || undefined,
      telefono: telefono ? Number(telefono) : undefined,
      familiarResponsable: textoPut(body.familiarNombre, 200) || undefined,
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