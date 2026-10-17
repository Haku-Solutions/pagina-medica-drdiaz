// Forma que devuelve `GET /api/pacientes` (un ExpedienteMedico del cirujano).
export interface Paciente {
  _id: string;
  nombreCompleto: string;
  edad?: number;
  curp?: string;
  sexo?: "M" | "F";
}
