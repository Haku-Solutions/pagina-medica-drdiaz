// Ajusta la ruta a donde guardaste el componente.
import EditarExpediente from "@/src/admin/components/EditarExpediente/EditarExpediente";

export default async function EditarExpedientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditarExpediente id={id} />;
}
