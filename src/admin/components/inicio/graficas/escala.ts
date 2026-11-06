/**
 * Calcula un paso "redondo" para el eje Y y el máximo resultante.
 * Así las guías caen en valores enteros legibles (ej. 7 → paso 2, eje hasta 8).
 */
export function escalaEje(valor: number): { paso: number; maximo: number } {
  if (valor <= 0) return { paso: 1, maximo: 4 };

  const magnitud = 10 ** Math.floor(Math.log10(valor));
  const normalizado = valor / magnitud;

  let paso: number;
  if (normalizado <= 1) paso = 1;
  else if (normalizado <= 2) paso = 2;
  else if (normalizado <= 5) paso = 5;
  else paso = 10;

  paso *= magnitud;

  const maximo = Math.ceil(valor / paso) * paso;
  return { paso, maximo };
}
