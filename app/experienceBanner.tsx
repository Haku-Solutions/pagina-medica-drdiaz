import Image from "next/image";
import MessengerButton from "@/src/styles/components/messengerButton/messengerButton";

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
          <MessengerButton
            username="1245458325315373"
            text="CONTACTO"
          />
        </div>

        <div className="experience-logos">
          <Image src="/assets/logos/cmcg.svg" alt="Consejo Mexicano de Cirugía General" width={80} height={80} />
          <Image src="/assets/logos/CGClogo.png" alt="Colegio de Cirujanos de Guerrero" width={80} height={80} />
          <Image src="/assets/logos/endoscopialogo.png" alt="Sociedad Mexicana de Endoscopia" width={80} height={80} />
          <Image src="/assets/logos/federacionmx.png" alt="Federación Mexicana de Cirugía General" width={80} height={80} />
        </div>
      </div>
    </section>
  );
}