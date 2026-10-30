import type { Metadata } from "next";
import VerExpediente from "@/src/admin/components/VerExpediente/VerExpediente";

export const metadata: Metadata = {
  title: "Ver Expediente",
  description: "Consulta de los datos del expediente médico.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function VerExpedientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <VerExpediente id={id} />;
}
