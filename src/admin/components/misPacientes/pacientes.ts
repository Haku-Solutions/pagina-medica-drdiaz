export interface Paciente {
  _id: string;
  nombreCompleto: string;
  fechaNacimiento?: string;
  sexo?: "M" | "F";
  curp?: string;
  telefono?: number;
  createdAt?: string;
}
