import type { Metadata } from "next";
import CrearExpediente from "@/src/admin/components/CrearExpediente/CrearExpediente";

export const metadata: Metadata = {
  title: "Crear Expediente",
  description: "Gestion de creación de expediente médico",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CrearExpedientePage() {
  return <CrearExpediente />;
}