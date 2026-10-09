import type { Metadata } from "next";
import CrearNota from "@/src/admin/crearNota/crearNota";

export const metadata: Metadata = {
  title: "Nueva Nota Operatoria",
  description: "Formulario para crear una nota operatoria.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CrearNotaPage() {
  return (
    <main className="crear-nota-page">
      <CrearNota />
    </main>
  );
}
