import type { Metadata } from "next";
import Inicio from "@/src/admin/components/inicio/inicio";

export const metadata: Metadata = {
  title: "Inicio",
  description: "Resumen de estadísticas de expedientes y cirugías.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InicioPage() {
  return (
    <main className="inicio-page">
      <Inicio />
    </main>
  );
}
