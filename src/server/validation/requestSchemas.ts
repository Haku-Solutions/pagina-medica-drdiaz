import { z } from "zod";

// Todos los objetos rechazan claves adicionales para evitar mass assignment.
const strictObject = <T extends z.ZodRawShape>(shape: T) =>
  z.object(shape).strict();

const textoLibre = (max: number) =>
  z.string().trim().max(max).refine(
    (value) =>
      !/[<>\u0000-\u0008\u000B\u000C\u000E-\u001F\p{Extended_Pictographic}\uFE0F\u200D]/u.test(value),
    "No se permiten emojis ni caracteres especiales",
  );

const textoNombre = (max: number) =>
  textoLibre(max).regex(/^[\p{L}\p{M}\s.'-]*$/u, "Usa solo letras y puntuación básica");

const textoNombreConNumeros = (max: number) =>
  textoLibre(max).regex(/^[\p{L}\p{M}\p{N}\s.'-]*$/u, "Usa letras y puntuación básica");

const telefono = z.string().regex(/^\d{10}$/).or(z.literal(""));
const fechaNacimiento = z.string().refine((value) => {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value) && date <= new Date();
}, "Fecha de nacimiento no válida");

export const loginBodySchema = strictObject({
  nombreUsuario: z.string().trim().min(1).max(80).regex(/^[\p{L}\p{N}_.-]+$/u),
  contraseña: z.string().min(1).max(200),
});

export const expedienteBodySchema = strictObject({
  nombre: textoNombreConNumeros(200).min(1),
  fechaNacimiento,
  sexo: z.enum(["", "hombre", "mujer"]),
  ciudadNacimiento: textoNombre(120),
  estadoNacimiento: textoNombre(120),
  curp: z.string().trim().toUpperCase().regex(/^([A-Z0-9]{18})?$/),
  residencia: textoNombre(160),
  antecedentes: textoLibre(5000),
  telefono,
  familiarNombre: textoNombre(200),
  familiarTelefono: telefono,
});

const notaFields = {
  idExpediente: z.string().regex(/^[a-f\d]{24}$/i),
  fechaCirugia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((v) => !Number.isNaN(new Date(`${v}T00:00:00Z`).getTime()) && new Date(`${v}T00:00:00Z`).toISOString().startsWith(v)),
  lugarCirugia: textoNombre(120).min(1),
  notaPreoperatoria: textoLibre(5000),
  notaPostoperatoria: textoLibre(5000),
  diagnosticoPreoperatorio: textoLibre(5000),
  diagnosticoPostoperatorio: textoLibre(5000),
  cirugiaProgramada: textoLibre(1500),
  cirugiaRealizada: textoLibre(1500),
  hallazgos: textoLibre(5000),
  tecnica: textoLibre(5000),
  sangrado: textoLibre(1000),
  drenajes: textoLibre(1000),
  materialesTextiles: textoLibre(1500),
  complicaciones: textoLibre(5000),
  ayudantes: textoLibre(2000),
  tipoAnestesia: textoLibre(500),
  anestesiologo: textoNombre(500),
  enfermeraInstrumentista: textoNombre(500),
  enfermeraCirculante: textoNombre(500),
  pronostico: textoLibre(5000),
  plan: textoLibre(3000),
  dieta: textoLibre(5000),
  soluciones: textoLibre(2000),
  medicamentos: textoLibre(3000),
  cuidadosGenerales: textoLibre(3000),
};

export const notaOperatoriaBodySchema = strictObject(notaFields);

// En la edición, el expediente se obtiene de la URL y no debe poder cambiarse
// desde el body. El resto de campos conserva las mismas reglas de creación.
export const notaOperatoriaUpdateBodySchema = z
  .object(notaFields)
  .omit({ idExpediente: true })
  .strict();
