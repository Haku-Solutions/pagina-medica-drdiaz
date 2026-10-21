import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";

const MESES_EN_VENTANA = 12;
const MAX_TIPOS_CIRUGIA = 8;
const MAX_LUGARES = 5;

interface ConteoAgrupado {
  _id: string | null;
  total: number;
}

interface ConteoMes {
  _id: string | null;
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

/** Normaliza los agregados de Mongo (`_id` + `total`) al formato `{ etiqueta, valor }`. */
function aDatosGrafica(agregados: ConteoAgrupado[]) {
  return agregados.map(({ _id, total }) => ({
    etiqueta: _id ?? "Sin especificar",
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

  const [cirugiasPorTipo, lugaresMasComunes, porSexo, cirugiasPorMes] = await Promise.all([
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
    NotaOperatoria.aggregate<ConteoMes>([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$fechaCirugia" } },
          total: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: MESES_EN_VENTANA },
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
  });
}
