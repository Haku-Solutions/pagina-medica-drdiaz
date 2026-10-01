import "./testimonialCard.css";

interface TestimonialCardProps {
  text: string;
  author: string;
  variant?: "white" | "blue";
}

export default function TestimonialCard({
  text,
  author,
  variant = "white",
}: TestimonialCardProps) {
  return (
    <article className={`testimonial-card ${variant}`}>
      <p className="testimonial-text">"{text}"</p>

      <h3 className="testimonial-author">
        -{author}
      </h3>
    </article>
  );
}

