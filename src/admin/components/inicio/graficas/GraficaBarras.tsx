import { colorPorIndice, recortar } from "./utils";
import type { DatoGrafica } from "./utils";
import "./graficas.css";

interface GraficaBarrasProps {
  datos: DatoGrafica[];
  etiquetaVacia?: string;
}

/** Altura de cada barra (label + barra). */
const ALTO_BANDA = 46;
/** Espacio reservado a la etiqueta antes de la barra. */
const ANCHO_ETIQUETA = 210;
/** Ancho total del área de barras. */
const ANCHO_BARRA = 470;

/**
 * Gráfica de barras horizontales en SVG puro.
 * Cada fila muestra la etiqueta, la barra proporcional al máximo y su valor.
 */
export default function GraficaBarras({
  datos,
  etiquetaVacia = "Sin datos para mostrar.",
}: GraficaBarrasProps) {
  if (datos.length === 0) {
    return <p className="grafica-vacia">{etiquetaVacia}</p>;
  }

  const maximo = Math.max(...datos.map((dato) => dato.valor), 1);
  const alto = datos.length * ALTO_BANDA;

  return (
    <svg
      className="grafica-svg"
      viewBox={`0 0 ${ANCHO_ETIQUETA + ANCHO_BARRA + 60} ${alto}`}
      role="img"
      aria-label="Gráfica de barras"
    >
      {datos.map((dato, indice) => {
        const y = indice * ALTO_BANDA;
        const ancho = Math.max((dato.valor / maximo) * ANCHO_BARRA, 2);

        return (
          <g key={dato.etiqueta}>
            <text
              className="grafica-texto grafica-etiqueta"
              x={ANCHO_ETIQUETA - 12}
              y={y + 26}
              textAnchor="end"
            >
              {recortar(dato.etiqueta, 26)}
            </text>

            <rect
              className="grafica-pista"
              x={ANCHO_ETIQUETA}
              y={y + 14}
              width={ANCHO_BARRA}
              height={20}
              rx={6}
            />

            <rect
              x={ANCHO_ETIQUETA}
              y={y + 14}
              width={ancho}
              height={20}
              rx={6}
              fill={colorPorIndice(indice)}
            />

            <text
              className="grafica-texto grafica-valor"
              x={ANCHO_ETIQUETA + ancho + 10}
              y={y + 29}
            >
              {dato.valor}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
