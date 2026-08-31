import Image from "next/image";
import MessengerButton from "@/src/styles/components/messengerButton/messengerButton";

import "./experienceBanner.css";

export default function ExperienceBanner() {
  return (
    <section className="experience-banner">
      <Image
        src="/assets/banner/banner.webp"
        alt="Cirujano General y Laparoscopista en Acapulco y Costa Chica de Guerrero"
        fill
        priority
        sizes="100vw"
        className="experience-banner-image"
      />
      <div className="experience-overlay" />

      <div className="experience-content">
        <div className="experience-text">
          <h1>MI EXPERIENCIA</h1>
          

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
            username="61592800274943"
            text="CONTACTO"
          />
        </div>

        <div className="experience-logos">
          <Image src="/assets/logos/CMCG.svg" alt="Consejo Mexicano de Cirugía General" width={80} height={80} style={{ width: "auto" }} />
          <Image src="/assets/logos/CGClogo.png" alt="Colegio de Cirujanos de Guerrero" width={80} height={80} style={{ width: "auto" }} />
          <Image src="/assets/logos/endoscopialogo.png" alt="Sociedad Mexicana de Endoscopia" width={80} height={80} style={{ width: "auto" }} />
          <Image src="/assets/logos/federacionmx.png" alt="Federación Mexicana de Cirugía General" width={80} height={80} style={{ width: "auto" }} />
        </div>
      </div>
    </section>
  );
}