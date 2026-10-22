export interface DatoGrafica {
  etiqueta: string;
  valor: number;
}

/** Paleta de colores institucional, alineada con el CSS de las vistas admin. */
export const PALETA = [
  "#1C2B48",
  "#4C8BB8",
  "#72C3FF",
  "#A7C7E7",
  "#00A05A",
  "#E0A800",
] as const;

export function colorPorIndice(indice: number): string {
  return PALETA[indice % PALETA.length];
}

/**
 * Calcula los segmentos de un gráfico de anillo.
 * Devuelve los ángulos acumulados para poder dibujar cada porción con `stroke-dasharray`.
 */
export function segmentosAnillo(
  datos: DatoGrafica[],
  circunferencia: number,
): { segmento: { valor: number; color: string }; offset: number; largo: number }[] {
  const total = datos.reduce((suma, dato) => suma + dato.valor, 0);

  if (total <= 0) return [];

  let acumulado = 0;

  return datos.map((dato, indice) => {
    const largo = (dato.valor / total) * circunferencia;
    const offset = acumulado;
    acumulado += largo;

    return {
      segmento: { valor: dato.valor, color: colorPorIndice(indice) },
      offset,
      largo,
    };
  });
}

/** Acorta una etiqueta para que no rompa el layout de la gráfica. */
export function recortar(texto: string, maximo: number): string {
  return texto.length > maximo ? `${texto.slice(0, maximo - 1)}…` : texto;
}

/**
 * Igual que `recortar`, pero corta en un límite de palabra.
 * Así "Colecistectomía laparoscópica" se muestra como "Colecistectomía…"
 * en lugar de dejar "Colecistectomía l…" a media palabra.
 */
export function recortarPorPalabra(texto: string, maximo: number): string {
  if (texto.length <= maximo) return texto;

  const limite = maximo - 1;
  const corte = texto.slice(0, limite);

  // Si el corte cae justo entre dos palabras, se respeta tal cual.
  if (texto[limite] === " ") return `${corte.trimEnd()}…`;

  const ultimoEspacio = corte.lastIndexOf(" ");
  if (ultimoEspacio > 0) return `${corte.slice(0, ultimoEspacio)}…`;

  return `${corte}…`;
}
