import type { Metadata } from "next";
import { redirect } from "next/navigation";
import CrearNota from "@/src/admin/components/CrearNota/CrearNota";

export const metadata: Metadata = {
  title: "Nueva Nota Operatoria",
  description: "Formulario para crear una nota operatoria.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CrearNotaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const expedienteId =
    typeof params.expedienteId === "string" ? params.expedienteId : undefined;
  if (!expedienteId) redirect("/admin/mispacientes");

  return (
    <main className="crear-nota-page">
      <CrearNota expedienteId={expedienteId} />
    </main>
  );
}
