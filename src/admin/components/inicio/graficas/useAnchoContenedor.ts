"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Mide el ancho real del contenedor para dibujar el SVG a escala 1:1.
 *
 * Las gráficas se construyen en coordenadas iguales a píxeles: así el texto de
 * las etiquetas conserva siempre su tamaño, en vez de estirarse o encogerse
 * con el `viewBox` cuando el panel cambia de columna.
 */
export function useAnchoContenedor<T extends HTMLElement>(anchoInicial = 640) {
  const ref = useRef<T | null>(null);
  const [ancho, setAncho] = useState(anchoInicial);

  useEffect(() => {
    const elemento = ref.current;
    if (!elemento) return;

    const medir = () => {
      const medido = Math.floor(elemento.getBoundingClientRect().width);
      if (medido > 0) setAncho(medido);
    };

    medir();

    const observador = new ResizeObserver(medir);
    observador.observe(elemento);

    return () => observador.disconnect();
  }, []);

  return { ref, ancho };
}
