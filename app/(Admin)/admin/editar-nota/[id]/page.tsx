import type { Metadata } from "next";
import EditarNota from "@/src/admin/components/EditarNota/EditarNota";

export const metadata: Metadata = {
  title: "Editar Nota Operatoria",
  description: "Edición de una nota operatoria registrada.",
  robots: { index: false, follow: false },
};

export default async function EditarNotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditarNota id={id} />;
}
