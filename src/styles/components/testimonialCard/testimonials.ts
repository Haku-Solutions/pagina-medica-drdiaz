export interface Testimonial {
  text: string;
  author: string;
  variant: "white" | "blue";
}

export const testimonials: Testimonial[] = [
  {
    text: "El doctor Díaz es un profesional cirujano Te brinda una atención clara, honesta te ayuda en todo momento. El y sus enfermeras dan un excelente servicio.",
    author: "Anayely Geronimo Salvador, san Francisco municipio de tecuanapa",
    variant: "blue",
  },
  {
    text: "Recomiendo ampliamente al Dr. Díaz. En mi experiencia, es un profesional muy atento y comprometido con sus pacientes. Siempre brinda un excelente trato, explica todo con claridad y transmite mucha confianza. Sin duda, lo volvería a recomendar.",
    author: "Paty Prestegui, Cruz Grande",
    variant: "white",
  },
];
