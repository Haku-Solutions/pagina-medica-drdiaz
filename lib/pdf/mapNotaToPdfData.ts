import type {
  ExpedientePdfSource,
  NotaOperatoriaPdfSource,
  NotaPostoperatoriaPdfData,
} from "./notaPostoperatoriaPdf.types";
import { cirujano, TIMEZONE } from "@/config/cirujano";

function text(value: string | number | null | undefined): string {
  return value == null ? "" : String(value).trim();
}

function validDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapNotaToPdfData(
  expediente: ExpedientePdfSource,
  nota: NotaOperatoriaPdfSource,
): NotaPostoperatoriaPdfData {
  const ingreso = validDate(nota.createdAt);
  const fechaCirugia = validDate(nota.fechaCirugia);
  const fechaIngreso = ingreso
    ? new Intl.DateTimeFormat("es-MX", {
        day: "2-digit", month: "2-digit", year: "numeric", timeZone: TIMEZONE,
      }).format(ingreso)
    : "";
  const horaIngreso = ingreso
    ? new Intl.DateTimeFormat("es-MX", {
        hour: "2-digit", minute: "2-digit", hour12: true, timeZone: TIMEZONE,
      }).format(ingreso).replace(/\s/g, "").toLowerCase().replace(/([ap])\.?m\.?/, "$1.m.")
    : "";
  return {
    paciente: {
      nombre: text(expediente.nombreCompleto),
      edad: expediente.edad == null ? "" : `${expediente.edad} años`,
      lugarCirugia: text(nota.lugarCirugia),
      fechaIngreso,
      horaIngreso,
    },
    fechaCirugia: fechaCirugia
      ? new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: TIMEZONE }).format(fechaCirugia)
      : "",
    nota: {
      diagnosticoPreoperatorio: text(nota.diagnosticoPreoperatorio),
      diagnosticoPostoperatorio: text(nota.diagnosticoPostoperatorio),
      cirugiaProgramada: text(nota.cirugiaProgramada),
      cirugiaRealizada: text(nota.cirugiaRealizada),
      hallazgos: text(nota.hallazgos),
      tecnica: text(nota.tecnica),
      sangrado: text(nota.sangrado),
      drenajes: text(nota.drenajes),
      materialesTextiles: text(nota.materialesTextiles),
      complicaciones: text(nota.complicaciones),
      cirujano: cirujano.campo,
      anestesiologo: text(nota.anestesiologo),
      tipoAnestesia: text(nota.tipoAnestesia),
      enfermeraInstrumentista: text(nota.enfermeraInstrumentista),
      enfermeraCirculante: text(nota.enfermeraCirculante),
      ayudantes: text(nota.ayudantes),
      pronostico: text(nota.pronostico),
      plan: text(nota.plan),
    },
    indicaciones: {
      dieta: text(nota.dieta),
      soluciones: text(nota.soluciones),
      medicamentos: text(nota.medicamentos),
      cuidadosGenerales: text(nota.cuidadosGenerales),
    },
  };
}
