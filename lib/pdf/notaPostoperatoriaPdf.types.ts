export interface NotaPostoperatoriaPdfData {
  paciente: {
    nombre: string;
    edad: string;
    lugarCirugia: string;
    fechaIngreso: string;
    horaIngreso: string;
  };
  fechaCirugia: string;
  nota: {
    diagnosticoPreoperatorio: string;
    diagnosticoPostoperatorio: string;
    cirugiaProgramada: string;
    cirugiaRealizada: string;
    hallazgos: string;
    tecnica: string;
    sangrado: string;
    drenajes: string;
    materialesTextiles: string;
    complicaciones: string;
    cirujano: string;
    anestesiologo: string;
    tipoAnestesia: string;
    enfermeraInstrumentista: string;
    enfermeraCirculante: string;
    ayudantes: string;
    pronostico: string;
    plan: string;
  };
  indicaciones: {
    dieta: string;
    soluciones: string;
    medicamentos: string;
    cuidadosGenerales: string;
  };
}

export interface ExpedientePdfSource {
  nombreCompleto?: string | null;
  edad?: number | null;
}

export interface NotaOperatoriaPdfSource {
  createdAt?: Date | string | null;
  fechaCirugia?: Date | string | null;
  lugarCirugia?: string | null;
  diagnosticoPreoperatorio?: string | null;
  diagnosticoPostoperatorio?: string | null;
  cirugiaProgramada?: string | null;
  cirugiaRealizada?: string | null;
  hallazgos?: string | null;
  tecnica?: string | null;
  sangrado?: string | null;
  drenajes?: string | null;
  materialesTextiles?: string | null;
  complicaciones?: string | null;
  anestesiologo?: string | null;
  tipoAnestesia?: string | null;
  enfermeraInstrumentista?: string | null;
  enfermeraCirculante?: string | null;
  ayudantes?: string | null;
  pronostico?: string | null;
  plan?: string | null;
  dieta?: string | null;
  soluciones?: string | null;
  medicamentos?: string | null;
  cuidadosGenerales?: string | null;
}
