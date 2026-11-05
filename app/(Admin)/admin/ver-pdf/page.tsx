import type { Metadata } from "next";
import CrearPDF from "@/src/admin/components/CrearPDF";
import { connectDB } from "@/src/server";
import { NotaOperatoria } from "@/src/server/db/model";
import type { ExpedientePdfSource, NotaOperatoriaPdfSource } from "@/lib/pdf/notaPostoperatoriaPdf.types";

export const metadata: Metadata = {
  title: "Crear PDF de Nota Postoperatoria",
  robots: { index: false, follow: false },
};

export default async function VerPdfPage() {
  await connectDB();
  const latestNote = await NotaOperatoria.findOne()
    .sort({ createdAt: -1 })
    .limit(1)
    .populate("idExpediente")
    .lean();

  const expediente = latestNote?.idExpediente;
  if (!latestNote || !expediente || typeof expediente !== "object" || !("nombreCompleto" in expediente)) {
    return <main className="min-h-screen p-6">No hay una nota operatoria con expediente disponible.</main>;
  }

  const notaPdf: NotaOperatoriaPdfSource = {
    createdAt: latestNote.createdAt,
    fechaCirugia: latestNote.fechaCirugia,
    lugarCirugia: latestNote.lugarCirugia,
    diagnosticoPreoperatorio: latestNote.diagnosticoPreoperatorio,
    diagnosticoPostoperatorio: latestNote.diagnosticoPostoperatorio,
    cirugiaProgramada: latestNote.cirugiaProgramada,
    cirugiaRealizada: latestNote.cirugiaRealizada,
    hallazgos: latestNote.hallazgos,
    tecnica: latestNote.tecnica,
    sangrado: latestNote.sangrado,
    drenajes: latestNote.drenajes,
    materialesTextiles: latestNote.materialesTextiles,
    complicaciones: latestNote.complicaciones,
    anestesiologo: latestNote.anestesiologo,
    tipoAnestesia: latestNote.tipoAnestesia,
    enfermeraInstrumentista: latestNote.enfermeraInstrumentista,
    enfermeraCirculante: latestNote.enfermeraCirculante,
    ayudantes: latestNote.ayudantes,
    pronostico: latestNote.pronostico,
    plan: latestNote.plan,
    dieta: latestNote.dieta,
    soluciones: latestNote.soluciones,
    medicamentos: latestNote.medicamentos,
    cuidadosGenerales: latestNote.cuidadosGenerales,
  };
  const expedientePdf: ExpedientePdfSource = {
    nombreCompleto: expediente.nombreCompleto,
    edad: expediente.edad,
  };

  return (
    <main className="min-h-screen p-6">
      <CrearPDF expediente={expedientePdf} nota={notaPdf} className="crear-pdf-action" />
      <style>{`.crear-pdf-action button { padding: .7rem 1.2rem; border: 0; border-radius: 4px; color: #fff; background: #2f6db5; cursor: pointer; font: inherit; } .crear-pdf-action button:disabled { opacity: .6; cursor: wait; } .crear-pdf-action p { color: #b42318; }`}</style>
    </main>
  );
}
