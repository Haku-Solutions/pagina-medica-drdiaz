"use client";

import { colorPorIndice, recortarPorPalabra } from "./utils";
import type { DatoGrafica } from "./utils";
import { useAnchoContenedor } from "./useAnchoContenedor";
import "./graficas.css";

interface GraficaBarrasProps {
  datos: DatoGrafica[];
  etiquetaVacia?: string;
}

/** Altura de cada banda (label + barra). */
const ALTO_BANDA = 46;
/** Espacio reservado al valor numérico que va tras la barra. */
const ESPACIO_VALOR = 46;
/** Ancho aproximado en píxeles de un carácter a 11.5px. */
const ANCHO_CARACTER = 6.4;

/**
 * Gráfica de barras horizontales en SVG puro.
 * Cada fila muestra la etiqueta, la barra proporcional al máximo y su valor.
 */
export default function GraficaBarras({
  datos,
  etiquetaVacia = "Sin datos para mostrar.",
}: GraficaBarrasProps) {
  const { ref, ancho } = useAnchoContenedor<HTMLDivElement>(640);

  // La etiqueta toma la parte que necesita; el resto es para la barra.
  const anchoEtiqueta = Math.round(
    Math.min(200, Math.max(96, ancho * 0.42)),
  );
  const anchoBarra = Math.max(ancho - anchoEtiqueta - ESPACIO_VALOR, 50);
  const maximoCaracteres = Math.max(8, Math.floor(anchoEtiqueta / ANCHO_CARACTER));

  const maximo = datos.length > 0 ? Math.max(...datos.map((dato) => dato.valor), 1) : 1;
  const alto = datos.length * ALTO_BANDA;

  return (
    <div className="grafica-lienzo" ref={ref}>
      {datos.length === 0 ? (
        <p className="grafica-vacia">{etiquetaVacia}</p>
      ) : (
        <svg
          className="grafica-svg"
          viewBox={`0 0 ${ancho} ${alto}`}
          role="img"
          aria-label="Gráfica de barras"
        >
          {datos.map((dato, indice) => {
            const y = indice * ALTO_BANDA;
            const anchoProporcional = Math.max(
              (dato.valor / maximo) * anchoBarra,
              2,
            );

            return (
              <g key={dato.etiqueta}>
                <text
                  className="grafica-texto grafica-etiqueta"
                  x={anchoEtiqueta - 12}
                  y={y + 26}
                  textAnchor="end"
                >
                  {recortarPorPalabra(dato.etiqueta, maximoCaracteres)}
                </text>

                <rect
                  className="grafica-pista"
                  x={anchoEtiqueta}
                  y={y + 14}
                  width={anchoBarra}
                  height={20}
                  rx={6}
                />

                <rect
                  x={anchoEtiqueta}
                  y={y + 14}
                  width={anchoProporcional}
                  height={20}
                  rx={6}
                  fill={colorPorIndice(indice)}
                />

                <text
                  className="grafica-texto grafica-valor"
                  x={anchoEtiqueta + anchoProporcional + 10}
                  y={y + 29}
                >
                  {dato.valor}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
