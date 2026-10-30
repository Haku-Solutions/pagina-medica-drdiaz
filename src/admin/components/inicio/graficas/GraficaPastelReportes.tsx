"use client";

import { colorPorIndice } from "./utils";
import { ALTO_GRAFICA } from "./utils";
import "./graficas.css";

interface GraficaPastelReportesProps {
  llenados: number;
  total: number;
  etiquetaVacia?: string;
}

const TAMANO = ALTO_GRAFICA;
const RADIO = Math.round(TAMANO * 0.364);
const GROSOR = Math.round(TAMANO * 0.155);

export default function GraficaPastelReportes({
  llenados,
  total,
  etiquetaVacia = "Sin datos para mostrar.",
}: GraficaPastelReportesProps) {
  if (total <= 0) {
    return <p className="grafica-vacia">{etiquetaVacia}</p>;
  }

  const circunferencia = 2 * Math.PI * RADIO;
  const porcion = Math.max(0, Math.min(1, llenados / total));
  const largoLlenado = porcion * circunferencia;

  const centroX = TAMANO / 2;
  const centroY = TAMANO / 2;

  return (
    <div className="grafica-anillo-contenedor">
      <svg
        className="grafica-svg"
        viewBox={`0 0 ${TAMANO} ${TAMANO}`}
        role="img"
        aria-label="Gráfica de pastel de reportes"
      >
        <circle
          className="grafica-pista"
          cx={centroX}
          cy={centroY}
          r={RADIO}
          fill="none"
          strokeWidth={GROSOR}
        />

        {porcion > 0 && (
          <circle
            cx={centroX}
            cy={centroY}
            r={RADIO}
            fill="none"
            stroke={colorPorIndice(0)}
            strokeWidth={GROSOR}
            strokeLinecap="round"
            strokeDasharray={`${largoLlenado} ${circunferencia - largoLlenado}`}
            strokeDashoffset={0}
            transform={`rotate(-90 ${centroX} ${centroY})`}
          />
        )}

        <text
          className="grafica-texto grafica-centro"
          x={centroX}
          y={centroY + 2}
          textAnchor="middle"
        >
          {llenados}/{total}
        </text>

        <text
          className="grafica-texto grafica-centro-sub"
          x={centroX}
          y={centroY + 24}
          textAnchor="middle"
        >
          Reportes llenados
        </text>
      </svg>

      <ul className="grafica-leyenda">
        <li className="grafica-leyenda-item">
          <span
            className="grafica-leyenda-muestra"
            style={{ backgroundColor: colorPorIndice(0) }}
          />
          <span>Llenados</span>
          <span className="grafica-leyenda-valor">
            {llenados} ({Math.round((llenados / total) * 100)}%)
          </span>
        </li>
        <li className="grafica-leyenda-item">
          <span
            className="grafica-leyenda-muestra"
            style={{ backgroundColor: "#d7dde8" }}
          />
          <span>Pendientes</span>
          <span className="grafica-leyenda-valor">
            {Math.max(0, total - llenados)} ({Math.round(((total - llenados) / total) * 100)}%)
          </span>
        </li>
      </ul>
    </div>
  );
}
