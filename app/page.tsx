import TestimonialCard from "@/components/testimonialCard";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <section className="w-full mt-16">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 justify-items-center">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                {...testimonial}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
interface Testimonial {
  text: string;
  author: string;
  variant: "white" | "blue";
}

const testimonials: Testimonial[] = [
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
    author: "John Doe",
    variant: "blue",
  },
  {
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    author: "John Doe",
    variant: "white",
  },
];