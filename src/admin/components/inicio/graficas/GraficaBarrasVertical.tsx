"use client";

import { colorPorIndice } from "./utils";
import type { DatoGrafica } from "./utils";
import { ALTO_GRAFICA } from "./utils";
import { escalaEje } from "./escala";
import { useAnchoContenedor } from "./useAnchoContenedor";
import "./graficas.css";

interface GraficaBarrasVerticalProps {
  datos: DatoGrafica[];
  etiquetaVacia?: string;
}

const MARGEN = { superior: 20, inferior: 56, izquierda: 44, derecha: 16 };
const ALTO_BARRA_MAX = ALTO_GRAFICA - MARGEN.superior - MARGEN.inferior;
/** Ancho máximo de una barra, para que pocas categorías no queden gigantes. */
const ANCHO_MAXIMO_BARRA = 52;
/** Porcentaje del grupo que ocupa la barra. */
const PROPORCION_BARRA = 0.55;

/**
 * Barras verticales en SVG puro, dibujadas 1:1 con el ancho del contenedor.
 * Las categorías se reparten el ancho completo para que la gráfica llene su panel.
 */
export default function GraficaBarrasVertical({
  datos,
  etiquetaVacia = "Sin datos para mostrar.",
}: GraficaBarrasVerticalProps) {
  const { ref, ancho } = useAnchoContenedor<HTMLDivElement>(520);

  if (datos.length === 0) {
    return (
      <div className="grafica-lienzo" ref={ref}>
        <p className="grafica-vacia">{etiquetaVacia}</p>
      </div>
    );
  }

  const maximoDatos = Math.max(...datos.map((dato) => dato.valor), 0);
  const { paso, maximo } = escalaEje(maximoDatos);
  const areaAncho = Math.max(ancho - MARGEN.izquierda - MARGEN.derecha, 40);
  const grupoAncho = areaAncho / datos.length;
  const anchoBarra = Math.min(
    ANCHO_MAXIMO_BARRA,
    Math.max(grupoAncho * PROPORCION_BARRA, 6),
  );

  const baseY = MARGEN.superior + ALTO_BARRA_MAX;
  const etiquetasAjustadas = grupoAncho < 48;

  const guias: { valor: number; y: number }[] = [];
  for (let valor = 0; valor <= maximo; valor += paso) {
    guias.push({ valor, y: baseY - (valor / maximo) * ALTO_BARRA_MAX });
  }

  return (
    <div className="grafica-lienzo" ref={ref}>
      <svg
        className="grafica-svg"
        viewBox={`0 0 ${ancho} ${ALTO_GRAFICA}`}
        role="img"
        aria-label="Distribución por edad"
      >
        {guias.map(({ valor, y }) => (
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
        ))}

        <text
          className="grafica-texto grafica-eje"
          x={MARGEN.izquierda - 24}
          y={MARGEN.superior + ALTO_BARRA_MAX / 2}
          textAnchor="middle"
          transform={`rotate(-90, ${MARGEN.izquierda - 24}, ${MARGEN.superior + ALTO_BARRA_MAX / 2})`}
        >
          Número de pacientes
        </text>

        {datos.map((dato, indice) => {
          const altura = (dato.valor / maximo) * ALTO_BARRA_MAX;
          const centroX = MARGEN.izquierda + indice * grupoAncho + grupoAncho / 2;
          const x = centroX - anchoBarra / 2;
          const y = baseY - altura;
          const etiquetaY = baseY + (etiquetasAjustadas ? 18 : 20);

          return (
            <g key={dato.etiqueta}>
              <rect
                x={x}
                y={y}
                width={anchoBarra}
                height={Math.max(altura, 2)}
                rx={4}
                fill={colorPorIndice(indice)}
              >
                <title>
                  {dato.etiqueta}: {dato.valor}
                </title>
              </rect>

              <text
                className="grafica-texto grafica-valor"
                x={centroX}
                y={y - 6}
                textAnchor="middle"
              >
                {dato.valor}
              </text>

              <text
                className="grafica-texto grafica-eje"
                x={centroX}
                y={etiquetaY}
                textAnchor={etiquetasAjustadas ? "end" : "middle"}
                transform={
                  etiquetasAjustadas
                    ? `rotate(-45, ${centroX}, ${etiquetaY})`
                    : undefined
                }
              >
                {dato.etiqueta}
              </text>
            </g>
          );
        })}

        <line
          className="grafica-linea-eje"
          x1={MARGEN.izquierda}
          y1={MARGEN.superior}
          x2={MARGEN.izquierda}
          y2={baseY}
        />
        <line
          className="grafica-linea-eje"
          x1={MARGEN.izquierda}
          y1={baseY}
          x2={ancho - MARGEN.derecha}
          y2={baseY}
        />

        <text
          className="grafica-texto grafica-eje"
          x={MARGEN.izquierda + areaAncho / 2}
          y={ALTO_GRAFICA - 6}
          textAnchor="middle"
        >
          Edad
        </text>
      </svg>
    </div>
  );
}
