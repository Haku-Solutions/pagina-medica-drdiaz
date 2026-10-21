import { segmentosAnillo } from "./utils";
import type { DatoGrafica } from "./utils";
import "./graficas.css";

interface GraficaAnilloProps {
  datos: DatoGrafica[];
  etiquetaVacia?: string;
  centro?: string;
  centroSub?: string;
}

const TAMANO = 220;
const RADIO = 80;
const GROSOR = 34;

/**
 * Gráfica de anillo (donut) en SVG puro.
 * Cada porción se dibuja con `stroke-dasharray` sobre la misma circunferencia.
 */
export default function GraficaAnillo({
  datos,
  etiquetaVacia = "Sin datos para mostrar.",
  centro,
  centroSub,
}: GraficaAnilloProps) {
  const total = datos.reduce((suma, dato) => suma + dato.valor, 0);

  if (total <= 0) {
    return <p className="grafica-vacia">{etiquetaVacia}</p>;
  }

  const circunferencia = 2 * Math.PI * RADIO;
  const segmentos = segmentosAnillo(datos, circunferencia);
  const centroX = TAMANO / 2;
  const centroY = TAMANO / 2;

  return (
    <div className="grafica-anillo-contenedor">
      <svg
        className="grafica-svg"
        viewBox={`0 0 ${TAMANO} ${TAMANO}`}
        role="img"
        aria-label="Gráfica de anillo"
      >
        <circle
          className="grafica-pista"
          cx={centroX}
          cy={centroY}
          r={RADIO}
          fill="none"
          strokeWidth={GROSOR}
        />

        {segmentos.map(({ segmento, offset, largo }, indice) => (
          <circle
            key={datos[indice].etiqueta}
            cx={centroX}
            cy={centroY}
            r={RADIO}
            fill="none"
            stroke={segmento.color}
            strokeWidth={GROSOR}
            strokeDasharray={`${largo} ${circunferencia - largo}`}
            strokeDashoffset={-offset}
            transform={`rotate(-90 ${centroX} ${centroY})`}
          />
        ))}

        {centro && (
          <text
            className="grafica-texto grafica-centro"
            x={centroX}
            y={centroY + 2}
            textAnchor="middle"
          >
            {centro}
          </text>
        )}

        {centroSub && (
          <text
            className="grafica-texto grafica-centro-sub"
            x={centroX}
            y={centroY + 24}
            textAnchor="middle"
          >
            {centroSub}
          </text>
        )}
      </svg>

      <ul className="grafica-leyenda">
        {datos.map((dato, indice) => (
          <li key={dato.etiqueta} className="grafica-leyenda-item">
            <span
              className="grafica-leyenda-muestra"
              style={{ backgroundColor: segmentos[indice].segmento.color }}
            />
            <span>{dato.etiqueta}</span>
            <span className="grafica-leyenda-valor">
              {dato.valor} ({Math.round((dato.valor / total) * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
