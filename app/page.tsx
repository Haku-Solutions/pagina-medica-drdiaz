import Image from "next/image";
import WhatsAppButton from "@/src/styles/components/contactButton/contactButton";
import NavBar from "@/src/styles/components/navBar/navBar";
import Footer from "@/src/styles/components/footer/footer";
import FlipCard from "@/src/styles/components/flipCard/flipCard";
import { Carousel } from "@/src/styles/components/carousel/carousel";
import { servicios } from "@/src/styles/components/carousel/servicios";
import TestimonialCard from "@/src/styles/components/testimonialCard/testimonialCard";
import { testimonials } from "@/src/styles/components/testimonialCard/testimonials";
import ExperienceBanner from "./experienceBanner";


export default function Home() {

  return (
    <>
      <NavBar
        title="DR. JOSÉ DÍAZ"
        subtitle="Cirugía general y laparoscopista"
        links={[
          { label: "Inicio", href: "/inicio" },
          { label: "Servicios", href: "/servicios" },
          { label: "Testimonios", href: "/testimonios" },
        ]}
      />
      <main>
        <ExperienceBanner />
        <section>
          <Carousel itemsPerPage={4}>
              {servicios.map((servicio) => (
                <div key={servicio.id} className="flex justify-center p-2">
            <FlipCard
              imageSrc={servicio.imagen}
              imageAlt={servicio.titulo}
              title={servicio.titulo}
              description={servicio.descripcion}
              backTitle={servicio.backTitle}
              backItems={servicio.backItems}
            />
          </div>
              ))}
            </Carousel>
        </section>

        <section>
          <h2 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Testimonios
          </h2>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Lo que dicen nuestros pacientes sobre su experiencia.
          </p>
        </section>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              text={testimonial.text}
              author={testimonial.author}
              variant={testimonial.variant}
            />
          ))}
        </div>
      </main>
      <Footer
        quote={"“Con más de 20 años de experiencia en cirugía general y endoscopia, mi compromiso es brindar una atención médica profesional, ética y de calidad. Gracias por confiar en mi experiencia para cuidar de tu salud”."}
        qrCode="/assets/qr_code/qrcode.png"
        instagram=""
        facebook=""
        email=""
      />
    </>
  );
}


