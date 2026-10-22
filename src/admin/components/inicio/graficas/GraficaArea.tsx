"use client";

import { useId } from "react";
import type { DatoGrafica } from "./utils";
import { escalaEje } from "./escala";
import { useAnchoContenedor } from "./useAnchoContenedor";
import "./graficas.css";

interface GraficaAreaProps {
  datos: DatoGrafica[];
  etiquetaVacia?: string;
}

const MARGEN = { superior: 20, inferior: 34, izquierda: 44, derecha: 16 };
const ALTO_MINIMO = 200;
const ALTO_MAXIMO = 340;

const MESES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

/** Convierte "2026-03" en "mar". */
function etiquetaCorta(etiqueta: string): string {
  const partes = etiqueta.split("-");
  if (partes.length !== 2) return etiqueta;

  const indice = Number(partes[1]) - 1;
  return MESES[indice] ?? etiqueta;
}

/**
 * Gráfica de área con línea superior, en SVG puro.
 * Muestra la evolución de un valor a lo largo del tiempo.
 */
export default function GraficaArea({
  datos,
  etiquetaVacia = "Sin datos para mostrar.",
}: GraficaAreaProps) {
  // useId genera ids con caracteres no válidos para url(#...); se limpian.
  const idDegradado = `area-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const { ref, ancho } = useAnchoContenedor<HTMLDivElement>(720);

  const alto = Math.round(
    Math.min(ALTO_MAXIMO, Math.max(ALTO_MINIMO, ancho * 0.3)),
  );
  const areaAncho = Math.max(ancho - MARGEN.izquierda - MARGEN.derecha, 40);
  const areaAlto = alto - MARGEN.superior - MARGEN.inferior;
  const baseY = MARGEN.superior + areaAlto;

  const maximoDatos =
    datos.length > 0 ? Math.max(...datos.map((dato) => dato.valor), 0) : 0;
  const { paso: pasoEje, maximo } = escalaEje(maximoDatos);

  const paso = datos.length > 1 ? areaAncho / (datos.length - 1) : 0;

  const puntos = datos.map((dato, indice) => {
    const x = MARGEN.izquierda + indice * paso;
    const y = baseY - (dato.valor / maximo) * areaAlto;
    return { x, y, dato };
  });

  const linea = puntos
    .map((punto, indice) => `${indice === 0 ? "M" : "L"} ${punto.x} ${punto.y}`)
    .join(" ");

  const area = `${linea} L ${puntos[puntos.length - 1].x} ${baseY} L ${puntos[0].x} ${baseY} Z`;

  const guias = [];
  for (let valor = 0; valor <= maximo; valor += pasoEje) {
    guias.push(valor);
  }

  return (
    <div className="grafica-lienzo" ref={ref}>
      {datos.length === 0 ? (
        <p className="grafica-vacia">{etiquetaVacia}</p>
      ) : (
        <svg
          className="grafica-svg"
          viewBox={`0 0 ${ancho} ${alto}`}
          role="img"
          aria-label="Gráfica de área"
        >
          <defs>
            <linearGradient id={idDegradado} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#72C3FF" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#72C3FF" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {guias.map((valor) => {
            const fraccion = valor / maximo;
            const y = baseY - fraccion * areaAlto;

            return (
              <g key={valor}>
                <line
                  className="grafica-linea-eje"
                  x1={MARGEN.izquierda}
                  y1={y}
                  x2={ancho - MARGEN.derecha}
                  y2={y}
                />
                <text
                  className="grafica-texto grafica-eje"
                  x={MARGEN.izquierda - 8}
                  y={y + 4}
                  textAnchor="end"
                >
                  {valor}
                </text>
              </g>
            );
          })}

          <path d={area} fill={`url(#${idDegradado})`} />

          <path
            d={linea}
            fill="none"
            stroke="#1C2B48"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {puntos.map((punto) => (
            <g key={`${punto.x}-${punto.dato.etiqueta}`}>
              <circle cx={punto.x} cy={punto.y} r={5} fill="#1C2B48" />
              <circle cx={punto.x} cy={punto.y} r={2.5} fill="#ffffff" />
              <title>
                {punto.dato.etiqueta}: {punto.dato.valor}
              </title>
            </g>
          ))}

          {puntos.map((punto) => (
            <text
              key={`etiqueta-${punto.x}-${punto.dato.etiqueta}`}
              className="grafica-texto grafica-eje"
              x={punto.x}
              y={baseY + 22}
              textAnchor="middle"
            >
              {etiquetaCorta(punto.dato.etiqueta)}
            </text>
          ))}
        </svg>
      )}
    </div>
  );
}
