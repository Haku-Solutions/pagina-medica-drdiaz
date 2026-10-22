import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";

const MESES_EN_VENTANA = 12;
const MAX_TIPOS_CIRUGIA = 12;
const MAX_LUGARES = 5;

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

/** Genera los últimos N meses en formato "YYYY-MM", del más antiguo al más reciente. */
function ultimosMeses(cantidad: number): string[] {
  const hoy = new Date();
  const meses: string[] = [];

  for (let i = cantidad - 1; i >= 0; i -= 1) {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    meses.push(`${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}`);
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

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const [totalExpedientes, totalCirugias] = await Promise.all([
    ExpedienteMedico.countDocuments(),
    NotaOperatoria.countDocuments(),
  ]);

  const [
    cirugiasPorTipo,
    lugaresMasComunes,
    porSexo,
    cirugiasPorMes,
    cirugiasPorTipoMes,
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
      { $limit: MAX_LUGARES },
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
  ]);

  const conteoPorMes = new Map(cirugiasPorMes.map(({ _id, total }) => [_id, total]));

  const cirugiasPorMesCompletos = ultimosMeses(MESES_EN_VENTANA).map((mes) => ({
    etiqueta: mes,
    valor: conteoPorMes.get(mes) ?? 0,
  }));

  return ok({
    totalExpedientes,
    totalCirugias,
    cirugiasPorTipo: aDatosGrafica(cirugiasPorTipo),
    lugaresMasComunes: aDatosGrafica(lugaresMasComunes),
    porSexo: aDatosGrafica(porSexo),
    cirugiasPorMes: cirugiasPorMesCompletos,
    cirugiasPorTipoMes: aDesglosePorTipo(cirugiasPorTipoMes),
  });
}
