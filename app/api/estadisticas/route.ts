import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";

const MESES_EN_VENTANA = 12;
const MAX_TIPOS_CIRUGIA = 12;

/**
 * Campos de texto que debe tener una nota operatoria para considerarse
 * "reporte completo". Se exige contenido real (no vacío ni solo espacios).
 */
const CAMPOS_REPORTE = [
  "lugarCirugia",
  "notaPreoperatoria",
  "notaPostoperatoria",
  "diagnosticoPreoperatorio",
  "diagnosticoPostoperatorio",
  "cirugiaProgramada",
  "cirugiaRealizada",
  "hallazgos",
  "tecnica",
  "sangrado",
  "drenajes",
  "materialesTextiles",
  "complicaciones",
  "ayudantes",
  "tipoAnestesia",
  "anestesiologo",
  "enfermeraInstrumentista",
  "enfermeraCirculante",
  "pronostico",
  "plan",
  "dieta",
  "soluciones",
  "medicamentos",
  "cuidadosGenerales",
] as const;

/** Una nota cuenta como completa si tiene fecha y todos los campos con texto. */
const FILTRO_REPORTE_COMPLETO = {
  fechaCirugia: { $type: "date" },
  $and: CAMPOS_REPORTE.map((campo) => ({ [campo]: { $regex: /\S/ } })),
};

interface ConteoAgrupado {
  _id: string | null;
  total: number;
}

interface ConteoPorMes {
  _id: string | null;
  total: number;
}

interface DesglosePorTipo {
  _id: {
    tipo: string | null;
    periodo: string | null;
  };
  total: number;
}

interface DesglosePorLugar {
  _id: {
    lugar: string | null;
    periodo: string | null;
  };
  total: number;
}

/** Genera los últimos N meses en formato "YYYY-MM", del más antiguo al más reciente. */
function ultimosMeses(cantidad: number): string[] {
  const hoy = new Date();
  const meses: string[] = [];

  for (let i = cantidad - 1; i >= 0; i -= 1) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    meses.push(
      `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`,
    );
  }

  return meses;
}

/** Primer día del mes más antiguo de la ventana, para acotar las agregaciones. */
function inicioDeVentana(cantidad: number): Date {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() - (cantidad - 1), 1);
}

/** Normaliza los agregados de Mongo (`_id` + `total`) al formato `{ etiqueta, valor }`. */
function aDatosGrafica(agregados: ConteoAgrupado[]) {
  return agregados.map(({ _id, total }) => ({
    etiqueta: _id ?? "Sin especificar",
    valor: total,
  }));
}

/**
 * Normaliza un desglose `tipo` + `periodo` al formato
 * `{ tipo, etiqueta, valor }`, listo para alimentar el histograma por cirugía.
 */
function aDesglosePorTipo(agregados: DesglosePorTipo[]) {
  return agregados.map(({ _id, total }) => ({
    tipo: _id.tipo ?? "Sin especificar",
    etiqueta: _id.periodo ?? "Sin especificar",
    valor: total,
  }));
}

/** Normaliza un desglose `lugar` + `periodo` al formato `{ lugar, etiqueta, valor }`. */
function aDesglosePorLugar(agregados: DesglosePorLugar[]) {
  return agregados.map(({ _id, total }) => ({
    lugar: _id.lugar ?? "Sin especificar",
    etiqueta: _id.periodo ?? "Sin especificar",
    valor: total,
  }));
}

const RANGOS_EDAD = [
  { etiqueta: "0-9", min: 0, max: 9 },
  { etiqueta: "10-19", min: 10, max: 19 },
  { etiqueta: "20-29", min: 20, max: 29 },
  { etiqueta: "30-39", min: 30, max: 39 },
  { etiqueta: "40-49", min: 40, max: 49 },
  { etiqueta: "50-59", min: 50, max: 59 },
  { etiqueta: "60-69", min: 60, max: 69 },
  { etiqueta: "70-79", min: 70, max: 79 },
  { etiqueta: "80-89", min: 80, max: 89 },
  { etiqueta: "90-99", min: 90, max: 99 },
  { etiqueta: "100+", min: 100, max: 200 },
];

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const ahora = new Date();
  const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMesActual = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 1);

  const [
    totalExpedientes,
    totalCirugias,
    reportesLlenados,
    reportesTotales,
    cirugiasMesActual,
  ] = await Promise.all([
    ExpedienteMedico.countDocuments(),
    NotaOperatoria.countDocuments(),
    NotaOperatoria.countDocuments(FILTRO_REPORTE_COMPLETO),
    NotaOperatoria.countDocuments({ fechaCirugia: { $type: "date" } }),
    NotaOperatoria.countDocuments({
      fechaCirugia: { $gte: inicioMesActual, $lt: finMesActual },
    }),
  ]);

  const [
    cirugiasPorTipo,
    lugaresMasComunes,
    porSexo,
    cirugiasPorMes,
    cirugiasPorTipoMes,
    cirugiasPorLugarMes,
    expedientesEdad,
  ] = await Promise.all([
    NotaOperatoria.aggregate<ConteoAgrupado>([
      { $match: { cirugiaProgramada: { $nin: [null, ""] } } },
      { $group: { _id: "$cirugiaProgramada", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: MAX_TIPOS_CIRUGIA },
    ]),
    NotaOperatoria.aggregate<ConteoAgrupado>([
      { $match: { lugarCirugia: { $nin: [null, ""] } } },
      { $group: { _id: "$lugarCirugia", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    ExpedienteMedico.aggregate<ConteoAgrupado>([
      { $match: { sexo: { $nin: [null, ""] } } },
      { $group: { _id: "$sexo", total: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    NotaOperatoria.aggregate<ConteoPorMes>([
      {
        $match: { fechaCirugia: { $gte: inicioDeVentana(MESES_EN_VENTANA) } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$fechaCirugia" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]),
    NotaOperatoria.aggregate<DesglosePorTipo>([
      {
        $match: {
          cirugiaProgramada: { $nin: [null, ""] },
          fechaCirugia: { $gte: inicioDeVentana(MESES_EN_VENTANA) },
        },
      },
      {
        $group: {
          _id: {
            tipo: "$cirugiaProgramada",
            periodo: {
              $dateToString: { format: "%Y-%m", date: "$fechaCirugia" },
            },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.periodo": 1 } },
    ]),
    NotaOperatoria.aggregate<DesglosePorLugar>([
      {
        $match: {
          lugarCirugia: { $nin: [null, ""] },
          fechaCirugia: { $gte: inicioDeVentana(MESES_EN_VENTANA) },
        },
      },
      {
        $group: {
          _id: {
            lugar: "$lugarCirugia",
            periodo: {
              $dateToString: { format: "%Y-%m", date: "$fechaCirugia" },
            },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.periodo": 1 } },
    ]),
    ExpedienteMedico.aggregate([
      {
        $project: {
          edadCalculada: {
            $cond: [
              { $and: [{ $ne: ["$edad", null] }, { $gte: ["$edad", 0] }] },
              "$edad",
              {
                $cond: [
                  { $ne: ["$fechaNacimiento", null] },
                  {
                    $floor: {
                      $divide: [
                        { $subtract: [new Date(), "$fechaNacimiento"] },
                        31557600000,
                      ],
                    },
                  },
                  null,
                ],
              },
            ],
          },
        },
      },
      {
        $match: {
          edadCalculada: { $gte: 0, $lte: 120 },
        },
      },
    ]),
  ]);

  const conteoPorMes = new Map(cirugiasPorMes.map(({ _id, total }) => [_id, total]));

  const cirugiasPorMesCompletos = ultimosMeses(MESES_EN_VENTANA).map((mes) => ({
    etiqueta: mes,
    valor: conteoPorMes.get(mes) ?? 0,
  }));

  const conteoPorRango = new Map<string, number>();
  for (const expediente of expedientesEdad) {
    const edad = (expediente as { edadCalculada: number }).edadCalculada;
    const rango = RANGOS_EDAD.find(
      (r) => edad >= r.min && edad <= r.max,
    );
    if (!rango) continue;
    conteoPorRango.set(rango.etiqueta, (conteoPorRango.get(rango.etiqueta) ?? 0) + 1);
  }

  const porEdad = RANGOS_EDAD.map((rango) => ({
    etiqueta: rango.etiqueta,
    valor: conteoPorRango.get(rango.etiqueta) ?? 0,
  })).filter((rango) => rango.valor > 0 || conteoPorRango.size === 0);

  return ok({
    totalExpedientes,
    totalCirugias,
    reportesLlenados,
    reportesTotales,
    cirugiasMesActual,
    cirugiasPorTipo: aDatosGrafica(cirugiasPorTipo),
    lugaresMasComunes: aDatosGrafica(lugaresMasComunes),
    porSexo: aDatosGrafica(porSexo),
    cirugiasPorMes: cirugiasPorMesCompletos,
    cirugiasPorTipoMes: aDesglosePorTipo(cirugiasPorTipoMes),
    cirugiasPorLugarMes: aDesglosePorLugar(cirugiasPorLugarMes),
    porEdad,
  });
}
