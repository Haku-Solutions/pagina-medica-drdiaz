import WhatsAppButton from "@/src/styles/components/contactButton/contactButton";

import "./experienceBanner.css";

export default function ExperienceBanner() {
  return (
    <section
      className="experience-banner"
      style={{ backgroundImage: "url('/assets/banner/banner.png')" }}
    >
      <div className="experience-overlay" />

      <div className="experience-content">
        <div className="experience-text">
          <h2>MI EXPERIENCIA</h2>

          <p>
            Soy cirujano general y laparoscopista, y desde hace más de 20 años
            he tenido la fortuna de cuidar la salud de personas y familias de
            la Costa Chica de Guerrero y Acapulco.
          </p>

          <p>
            A lo largo de estos años he atendido a pacientes de muchas
            comunidades de la región, incluyendo comunidades indígenas. He
            conocido sus costumbres, valoro su confianza y creo que todas las
            personas merecen recibir una atención médica digna, respetuosa y
            humana.
          </p>

          <p>
            Mi objetivo es que se sientan acompañados desde la primera consulta
            hasta su recuperación. Será un gusto recibirte y poner mi
            experiencia al servicio de tu salud.
          </p>
        </div>

        <div className="experience-button">
          <WhatsAppButton
            phone=""
            message="Hola. Me gustaría agendar una cita."
          />
        </div>

        <div className="experience-logos">
          <img src="/assets/logos/cmcg.svg" alt="CMCG" />
          <img src="/assets/logos/CGClogo.png" alt="Colegio" />
          <img src="/assets/logos/endoscopialogo.png" alt="Endoscopia" />
          <img src="/assets/logos/federacionmx.png" alt="Federación" />
        </div>
      </div>
    </section>
  );
}