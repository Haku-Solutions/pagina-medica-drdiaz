import type { Metadata } from "next";
import VerNota from "@/src/admin/components/VerNota/VerNota";

export const metadata: Metadata = {
  title: "Ver Nota Operatoria",
  description: "Consulta de la nota operatoria registrada.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VerNotaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VerNota id={id} />;
}
