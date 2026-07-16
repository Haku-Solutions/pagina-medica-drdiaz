export interface Testimonial {
  text: string;
  author: string;
  variant: "white" | "blue";
}

export const testimonials: Testimonial[] = [
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    author: "John Doe",
    variant: "blue",
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    author: "John Doe",
    variant: "white",
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    author: "John MONSE XD",
    variant: "blue",
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    author: "John CHARLIE",
    variant: "white",
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    author: "John LEO",
    variant: "blue",
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    author: "John LALO",
    variant: "white",
  },
];