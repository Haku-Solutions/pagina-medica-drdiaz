import NavBar from "@/src/styles/components/navBar/navBar";
import Footer from "@/src/styles/components/footer/footer";
import FlipCard from "@/src/styles/components/flipCard/flipCard";
import { Carousel } from "@/src/styles/components/carousel/carousel";
import { servicios } from "@/src/styles/components/carousel/servicios";
import TestimonialCard from "@/src/styles/components/testimonialCard/testimonialCard";
import { testimonials } from "@/src/styles/components/testimonialCard/testimonials";
import ExperienceBanner from "./experienceBanner";
import "./page.css";

export default function Home() {

  return (
    <div className="page-container">
      <NavBar
        title="DR. JOSÉ DÍAZ"
        subtitle="Cirugía general y laparoscopista"
        links={[
          { label: "Inicio", href: "/inicio" },
          { label: "Servicios", href: "/servicios" },
          { label: "Testimonios", href: "/testimonios" },
        ]}
      />
      <ExperienceBanner />
      <div className="servicios-section">
        <h2 className="servicios-title">Servicios</h2>
        <p className="servicios-subtitle">Atención general y quirúrgica </p>
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
      </div>

      <div className="testimonios-section">
        <h2 className="testimonios-title">
          Testimonios
        </h2>
        <p className="testimonios-subtitle">Declaraciones de pacientes</p>
        <div className="testimonios-cards">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              text={testimonial.text}
              author={testimonial.author}
              variant={testimonial.variant}
            />
          ))}
        </div>
      </div>
      <Footer
        quote="“Con más de 20 años de experiencia en cirugía general y endoscopia, mi compromiso es brindar una atención médica profesional, ética y de calidad. Gracias por confiar en mi experiencia para cuidar de tu salud”."
        qrCode="/assets/qr_code/qrcode.png"
        facebook="https://www.facebook.com/profile.php?id=61592800274943&mibextid=wwXIfr&rdid=bTlYTkuAomkummKd&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1D1GnmpTuV%2F%3Fmibextid%3DwwXIfr#"
        email=""
      />

    </div>
  );
}


