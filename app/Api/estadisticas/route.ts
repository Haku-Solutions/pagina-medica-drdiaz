import { getSessionUser } from "@/src/server/auth/requireSession";
import { connectDB } from "@/src/server";
import { ExpedienteMedico, NotaOperatoria } from "@/src/server/db/model";
import { fail, ok } from "@/src/server/utils/apiResponse";

export async function GET() {
  const session = await getSessionUser();
  if (!session) return fail("No autorizado", 401);

  await connectDB();

  const totalExpedientes = await ExpedienteMedico.countDocuments();
  const totalCirugias = await NotaOperatoria.countDocuments();

  const cirugiasPorTipo = await NotaOperatoria.aggregate([
    { $group: { _id: "$cirugiaProgramada", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);

  const lugaresMasComunes = await NotaOperatoria.aggregate([
    { $group: { _id: "$lugarCirugia", total: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
  ]);

  const porSexo = await ExpedienteMedico.aggregate([
    { $group: { _id: "$sexo", total: { $sum: 1 } } },
  ]);

  return ok({
    totalExpedientes,
    totalCirugias,
    cirugiasPorTipo,
    lugaresMasComunes,
    porSexo,
  });
}
