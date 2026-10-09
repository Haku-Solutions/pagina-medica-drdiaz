import { Schema, model, models, type InferSchemaType } from "mongoose";

export const cirujanoSchema = new Schema(
  {
    nombre_usuario: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
  }
);

export const expedienteSchema = new Schema(
  {
    id_cirujano: { type: Schema.Types.ObjectId, ref: "Cirujano", required: true },
    nombre_completo: { type: String, required: true },
    fecha_nacimiento: Date,
    sexo: { type: String, enum: ["M", "F"]},
    antecedentes: String,
    Edad: Number,
    estado: String,
    municipio: String,
    curp: String,
    lugar_residencia: String,
    telefono: Number,
    familiar_responsable: String,
    telefono_familiar: Number,
  },
  { timestamps: true }
);

export const notaOperatoriaSchema = new Schema(
  {
    id_expediente: { type: Schema.Types.ObjectId, ref: "ExpedienteMedico", required: true },
    fecha_cirugia: { type: Date, required: true },
    lugar_cirugia: { type: String, required: true },
    nota_preoperatoria: String,
    nota_postoperatoria: String,
    diagnostico_preoperatorio: String,
    diagnostico_postoperatorio: String,
    cirugia_programada: String,
    cirugia_realizada: String,
    hallazgos: String,
    tecnica: String,
    sangrado: String,
    drenajes: String,
    materiales_textiles: String,
    complicaciones: String,
    ayudantes: String,
    tipo_anestesia: String,
    anestesiologo: String,
    enfermera_instrumentista: String,
    enfermera_circulante: String,
    pronostico: String,
    plan: String,
    dieta: String,
    soluciones: String,
    medicamentos: String,
    cuidados_generales: String,
  },
  { timestamps: true }
);

export const archivoSchema = new Schema(
  {
    id_nota: { type: Schema.Types.ObjectId, ref: "NotaOperatoria", required: true },
    nombre_archivo: { type: String, required: true },
    formato_archivo: { type: String, required: true },
    url: { type: String, required: true },
  },
  { timestamps: true }
);

export const Cirujano = models.Cirujano || model("Cirujano", cirujanoSchema);
export const ExpedienteMedico = models.ExpedienteMedico || model("ExpedienteMedico", expedienteSchema);
export const NotaOperatoria = models.NotaOperatoria || model("NotaOperatoria", notaOperatoriaSchema);
export const Archivo = models.Archivo || model("Archivo", archivoSchema);