// Lógica de "mis pacientes": un paciente se guarda como un ExpedienteMedico
// ligado al cirujano de la sesión (idCirujano).

export type Sexo = "M" | "F";

export interface PacienteDatos {
  nombreCompleto?: string;
  fechaNacimiento?: Date;
  sexo?: Sexo;
  edad?: number;
  antecedentes?: string;
  estado?: string;
  municipio?: string;
  curp?: string;
  lugarResidencia?: string;
  telefono?: number;
  familiarResponsable?: string;
  telefonoFamiliar?: number;
}

const CAMPOS_TEXTO = [
  "antecedentes",
  "estado",
  "municipio",
  "lugarResidencia",
  "familiarResponsable",
] as const;

/** Escapa caracteres especiales para poder buscar texto con `$regex`. */
export function escapeRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function calcularEdad(fechaNacimiento: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();

  const aunNoCumple =
    hoy.getMonth() < fechaNacimiento.getMonth() ||
    (hoy.getMonth() === fechaNacimiento.getMonth() &&
      hoy.getDate() < fechaNacimiento.getDate());

  if (aunNoCumple) edad -= 1;

  return Math.max(0, edad);
}

function limpiarTexto(valor: unknown): string | undefined {
  if (typeof valor !== "string") return undefined;
  const limpio = valor.trim();
  return limpio.length > 0 ? limpio : undefined;
}

function parsearFecha(valor: unknown): Date | undefined {
  if (typeof valor !== "string" || valor.trim() === "") return undefined;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? undefined : fecha;
}

function parsearTelefono(valor: unknown): number | undefined {
  if (typeof valor === "number") {
    return Number.isFinite(valor) ? valor : undefined;
  }
  if (typeof valor !== "string") return undefined;

  const digitos = valor.replace(/\D/g, "");
  return digitos.length > 0 ? Number(digitos) : undefined;
}

function normalizarSexo(valor: unknown): Sexo | undefined {
  if (typeof valor !== "string") return undefined;

  switch (valor.trim().toLowerCase()) {
    case "m":
    case "hombre":
    case "masculino":
      return "M";
    case "f":
    case "mujer":
    case "femenino":
      return "F";
    default:
      return undefined;
  }
}

export interface NormalizarPacienteOpciones {
  /** En `POST` el nombre es obligatorio; en `PUT` es opcional. */
  requerirNombre?: boolean;
}

export function normalizarPaciente(
  body: Record<string, unknown>,
  { requerirNombre = false }: NormalizarPacienteOpciones = {}
): { datos: PacienteDatos; error?: string } {
  const datos: PacienteDatos = {};

  const nombreCompleto = limpiarTexto(body.nombreCompleto);
  if (requerirNombre && !nombreCompleto) {
    return { datos, error: "El nombre completo es obligatorio" };
  }
  if (nombreCompleto) datos.nombreCompleto = nombreCompleto;

  const fechaNacimiento = parsearFecha(body.fechaNacimiento);
  if (fechaNacimiento) {
    datos.fechaNacimiento = fechaNacimiento;
    datos.edad = calcularEdad(fechaNacimiento);
  }

  const sexo = normalizarSexo(body.sexo);
  if (sexo) datos.sexo = sexo;

  const curp = limpiarTexto(body.curp);
  if (curp) datos.curp = curp.toUpperCase();

  for (const campo of CAMPOS_TEXTO) {
    const valor = limpiarTexto(body[campo]);
    if (valor) datos[campo] = valor;
  }

  const telefono = parsearTelefono(body.telefono);
  if (telefono !== undefined) datos.telefono = telefono;

  const telefonoFamiliar = parsearTelefono(body.telefonoFamiliar);
  if (telefonoFamiliar !== undefined) datos.telefonoFamiliar = telefonoFamiliar;

  return { datos };
}
