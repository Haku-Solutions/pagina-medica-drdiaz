export const SEXO = ["M", "F"] as const;

export type Sexo = (typeof SEXO)[number];