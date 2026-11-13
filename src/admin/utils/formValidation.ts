const etiquetas: Record<string, string> = {
  nombre: "Nombre completo",
  fechaNacimiento: "Fecha de nacimiento",
  sexo: "Sexo",
  ciudadNacimiento: "Ciudad de nacimiento",
  estadoNacimiento: "Estado de nacimiento",
  curp: "CURP",
  residencia: "Lugar de residencia",
  antecedentes: "Antecedentes",
  telefono: "Teléfono",
  familiarNombre: "Nombre del familiar responsable",
  familiarTelefono: "Teléfono del familiar responsable",
  fechaCirugia: "Fecha de la cirugía",
  lugarCirugia: "Lugar de la cirugía",
  notaPreoperatoria: "Nota preoperatoria",
  notaPostoperatoria: "Nota postoperatoria",
  diagnosticoPreoperatorio: "Diagnóstico preoperatorio",
  diagnosticoPostoperatorio: "Diagnóstico postoperatorio",
  cirugiaProgramada: "Cirugía programada",
  cirugiaRealizada: "Cirugía realizada",
  hallazgos: "Hallazgos",
  tecnica: "Técnica",
  sangrado: "Sangrado",
  drenajes: "Drenajes",
  materialesTextiles: "Materiales y textiles",
  complicaciones: "Complicaciones",
  anestesiologo: "Anestesiólogo",
  tipoAnestesia: "Tipo de anestesia",
  enfermeraInstrumentista: "Enfermera instrumentista",
  enfermeraCirculante: "Enfermera circulante",
  ayudantes: "Ayudantes",
  pronostico: "Pronóstico",
  plan: "Plan",
  dieta: "Dieta",
  soluciones: "Soluciones",
  medicamentos: "Medicamentos",
  cuidadosGenerales: "Cuidados generales",
};

export function resumenErroresCampos(campos: unknown): string | null {
  if (!campos || typeof campos !== "object") return null;
  const errores = Object.entries(campos as Record<string, unknown>)
    .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0)
    .map(([campo, mensaje]) => `${etiquetas[campo] ?? campo}: ${mensaje}`);

  return errores.length ? `Corrige estos campos: ${errores.join(" ")}` : null;
}
