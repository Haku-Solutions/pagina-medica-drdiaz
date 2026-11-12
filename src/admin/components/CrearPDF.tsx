"use client";

import { useState, type ReactNode } from "react";
import { generateNotaPostoperatoriaPdf } from "@/lib/pdf/generateNotaPostoperatoriaPdf";
import { mapNotaToPdfData } from "@/lib/pdf/mapNotaToPdfData";
import type { ExpedientePdfSource, NotaOperatoriaPdfSource } from "@/lib/pdf/notaPostoperatoriaPdf.types";

interface CrearPDFProps {
  expediente: ExpedientePdfSource;
  nota: NotaOperatoriaPdfSource;
  className?: string;
  buttonClassName?: string;
  ariaLabel?: string;
  children?: ReactNode;
}

export default function CrearPDF({
  expediente,
  nota,
  className = "",
  buttonClassName = "",
  ariaLabel = "Crear PDF",
  children,
}: CrearPDFProps) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function crear() {
    setCargando(true);
    setError("");
    try {
      const { jsPDF } = await import("jspdf");
      await generateNotaPostoperatoriaPdf(mapNotaToPdfData(expediente, nota), jsPDF);
    } catch (fallo) {
      console.error("No se pudo generar el PDF de la nota postoperatoria:", fallo);
      setError("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={crear}
        disabled={cargando}
        className={buttonClassName}
        aria-label={cargando ? "Generando PDF" : ariaLabel}
        title={cargando ? "Generando PDF..." : ariaLabel}
      >
        {children ?? (cargando ? "Generando PDF..." : "Crear PDF")}
      </button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
