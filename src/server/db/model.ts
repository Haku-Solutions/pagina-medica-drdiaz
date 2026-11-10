import { Schema, model, models } from "mongoose";

export const cirujanoSchema = new Schema(
  {
    nombreUsuario: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
  },
  { timestamps: true }
);

export const expedienteSchema = new Schema(
  {
    idCirujano: { type: Schema.Types.ObjectId, ref: "Cirujano", required: true },
    nombreCompleto: { type: String, required: true },
    fechaNacimiento: Date,
    sexo: { type: String, enum: ["M", "F"] },
    antecedentes: String,
    edad: Number,
    estado: String,
    municipio: String,
    curp: String,
    lugarResidencia: String,
    telefono: Number,
    familiarResponsable: String,
    telefonoFamiliar: Number,
  },
  { timestamps: true }
);

export const notaOperatoriaSchema = new Schema(
  {
    idExpediente: { type: Schema.Types.ObjectId, ref: "ExpedienteMedico", required: true },
    fechaCirugia: { type: Date, required: true },
    lugarCirugia: { type: String, required: true },
    notaPreoperatoria: String,
    notaPostoperatoria: String,
    diagnosticoPreoperatorio: String,
    diagnosticoPostoperatorio: String,
    cirugiaProgramada: String,
    cirugiaRealizada: String,
    hallazgos: String,
    tecnica: String,
    sangrado: String,
    drenajes: String,
    materialesTextiles: String,
    complicaciones: String,
    ayudantes: String,
    tipoAnestesia: String,
    anestesiologo: String,
    enfermeraInstrumentista: String,
    enfermeraCirculante: String,
    pronostico: String,
    plan: String,
    dieta: String,
    soluciones: String,
    medicamentos: String,
    cuidadosGenerales: String,
  },
  { timestamps: true }
);

export const archivoSchema = new Schema(
  {
    idNota: { type: Schema.Types.ObjectId, ref: "NotaOperatoria", required: true },
    nombreArchivo: { type: String, required: true },
    formatoArchivo: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const Cirujano = models.Cirujano || model("Cirujano", cirujanoSchema);
export const ExpedienteMedico = models.ExpedienteMedico || model("ExpedienteMedico", expedienteSchema);
export const NotaOperatoria = models.NotaOperatoria || model("NotaOperatoria", notaOperatoriaSchema);
export const Archivo = models.Archivo || model("Archivo", archivoSchema);