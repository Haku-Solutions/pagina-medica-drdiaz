"use client";

import { useId } from "react";
import type { DatoGrafica } from "./utils";
import { recortar } from "./utils";
import { escalaEje } from "./escala";
import "./graficas.css";

interface GraficaHistogramaProps {
  datos: DatoGrafica[];
  etiquetaVacia?: string;
  /** Color de las barras. */
  color?: string;
  /** Altura total del lienzo en unidades del viewBox. */
  alto?: number;
  /** Etiqueta de la categoría actualmente seleccionada. */
  seleccionada?: string | null;
  /** Callback al pulsar una barra. */
  onSeleccionar?: (etiqueta: string) => void;
}

const ANCHO = 720;
const MARGEN = { superior: 22, inferior: 146, izquierda: 44, derecha: 16 };
/** Ancho máximo de una barra, para que una sola categoría no ocupe todo. */
const ANCHO_MAXIMO_BARRA = 90;
/** Ancho aproximado en unidades de viewBox de un carácter a 10.5px. */
const ANCHO_CARACTER = 5.8;
/** Seno/coseno de 45°: la proyección de una etiqueta rotada sobre cada eje. */
const SENO_45 = Math.SQRT1_2;

/**
 * Histograma de barras verticales en SVG puro.
 * Las barras son contiguas (sin separación) para dar la lectura continua
 * propia de un histograma, a diferencia de un gráfico de barras por categoría.
 */
export default function GraficaHistograma({
  datos,
  etiquetaVacia = "Sin datos para mostrar.",
  color = "#4C8BB8",
  alto = 354,
  seleccionada = null,
  onSeleccionar,
}: GraficaHistogramaProps) {
  const idDegradado = `histo-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  if (datos.length === 0) {
    return <p className="grafica-vacia">{etiquetaVacia}</p>;
  }

  const areaAncho = ANCHO - MARGEN.izquierda - MARGEN.derecha;
  const areaAlto = alto - MARGEN.superior - MARGEN.inferior;
  const baseY = MARGEN.superior + areaAlto;

  const maximoDatos = Math.max(...datos.map((dato) => dato.valor), 0);
  const { paso: pasoEje, maximo } = escalaEje(maximoDatos);

  const anchoBanda = areaAncho / datos.length;
  const anchoBarra = Math.max(Math.min(anchoBanda - 2, ANCHO_MAXIMO_BARRA), 3);

  /*
   * Las etiquetas se rotan -45°, así que se despliegan hacia abajo-izquierda.
   * El largo máximo lo limitan dos cosas: el espacio vertical que queda bajo
   * el eje y el borde izquierdo del lienzo (afecta a la primera etiqueta).
   */
  const espacioVertical = alto - (baseY + 18);
  const largoPorAltura = espacioVertical / SENO_45;
  const largoPorBorde = (MARGEN.izquierda + anchoBanda / 2) / SENO_45;
  const largoMaximo = Math.max(Math.min(largoPorAltura, largoPorBorde), 48);
  const maximoCaracteres = Math.max(6, Math.floor(largoMaximo / ANCHO_CARACTER));

  const guias = [];
  for (let valor = 0; valor <= maximo; valor += pasoEje) {
    guias.push(valor);
  }

  return (
    <svg
      className="grafica-svg"
      viewBox={`0 0 ${ANCHO} ${alto}`}
      role="img"
      aria-label="Histograma de cirugías"
    >
      <defs>
        <linearGradient id={idDegradado} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.55" />
        </linearGradient>
      </defs>

      {guias.map((valor) => {
        const y = baseY - (valor / maximo) * areaAlto;

        return (
          <g key={valor}>
            <line
              className="grafica-linea-eje"
              x1={MARGEN.izquierda}
              y1={y}
              x2={ANCHO - MARGEN.derecha}
              y2={y}
            />
            <text
              className="grafica-texto grafica-eje"
              x={MARGEN.izquierda - 10}
              y={y + 4}
              textAnchor="end"
            >
              {valor}
            </text>
          </g>
        );
      })}

      {datos.map((dato, indice) => {
        const centroBanda = MARGEN.izquierda + indice * anchoBanda + anchoBanda / 2;
        const x = centroBanda - anchoBarra / 2;
        const altura = (dato.valor / maximo) * areaAlto;
        const y = baseY - altura;
        const activa = seleccionada === dato.etiqueta;
        const atenuada = Boolean(seleccionada) && !activa;

        return (
          <g
            key={dato.etiqueta}
            className={onSeleccionar ? "grafica-barra-grupo" : undefined}
            onClick={
              onSeleccionar ? () => onSeleccionar(dato.etiqueta) : undefined
            }
          >
            <rect
              className="grafica-barra"
              x={x}
              y={y}
              width={anchoBarra}
              height={Math.max(altura, 0)}
              rx={2}
              fill={`url(#${idDegradado})`}
              opacity={atenuada ? 0.32 : 1}
              stroke={activa ? color : "none"}
              strokeWidth={activa ? 2 : 0}
            >
              <title>
                {dato.etiqueta}: {dato.valor}
              </title>
            </rect>

            {dato.valor > 0 && (
              <text
                className="grafica-texto grafica-valor"
                x={centroBanda}
                y={y - 8}
                textAnchor="middle"
                opacity={atenuada ? 0.32 : 1}
              >
                {dato.valor}
              </text>
            )}

            <text
              className="grafica-texto grafica-eje"
              x={centroBanda}
              y={baseY + 18}
              textAnchor="end"
              transform={`rotate(-45 ${centroBanda} ${baseY + 18})`}
              opacity={atenuada ? 0.45 : 1}
            >
              {recortar(dato.etiqueta, maximoCaracteres)}
            </text>
          </g>
        );
      })}

      <line
        className="grafica-linea-eje"
        x1={MARGEN.izquierda}
        y1={baseY}
        x2={ANCHO - MARGEN.derecha}
        y2={baseY}
      />
    </svg>
  );
}
