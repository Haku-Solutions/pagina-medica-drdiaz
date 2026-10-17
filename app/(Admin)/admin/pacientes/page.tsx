import type { Metadata } from "next";
import MisPacientes from "@/src/admin/components/misPacientes/misPacientes";

export const metadata: Metadata = {
  title: "Mis Pacientes",
  description: "Gestión de expedientes de pacientes.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function MisPacientesPage() {
  return (
    <main className="mis-pacientes-page">
      <MisPacientes />
    </main>
  );
}
