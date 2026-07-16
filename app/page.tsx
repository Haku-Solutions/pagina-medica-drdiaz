import Image from "next/image";
import WhatsAppButton from "@/src/styles/components/contactButton/contactButton";
import NavBar from "@/src/styles/components/navBar/navBar";
import FlipCard from "@/src/styles/components/flipCard/flipCard";
import { Carousel } from "@/src/styles/components/carousel/carousel";
import { servicios } from "@/src/styles/components/carousel/servicios";

export default function Home() {

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <NavBar
        title="DR. JOSÉ DÍAZ"
        subtitle="Cirugía general y laparoscopista"
        links={[
          { label: "Inicio", href: "/inicio" },
          { label: "Servicios", href: "/servicios" },
          { label: "Testimonios", href: "/testimonios" },
        ]}
      />
      
      <main className="flex flex-1 w-full max-w-6xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        {/* Se subió el max-w de la sección anterior a max-w-6xl para que el carrusel de 3 columnas tenga espacio para lucir */}
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left my-8">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Test Darius King
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to Templates.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
          </a>
        </div>
          <WhatsAppButton
        phone=""
        message="Hola. Me gustaría agendar una cita."
         />
        <div>
          <Carousel itemsPerPage={4}>
            {servicios.map((servicio) => (
              <div key={servicio.id} className="flex justify-center p-2">
          <FlipCard
            imageSrc={servicio.imagen}
            imageAlt={servicio.titulo}
            title={servicio.titulo}
            description={servicio.descripcion}
            back_description="Era una noche maravillosa, una de esas noches que quizá
                              sólo vemos cuando somos jóvenes, querido lector. Había un
                              cielo tan profundo y tan claro que, al mirarlo, no tenía uno más
                              remedio que preguntarse, sin querer, si era verdad que debajo
                              de un cielo semejante pudiesen vivir criaturas malvadas y
                              tétricas cuestión esta que, a decir verdad, sólo se la puede uno
                              plantear cuando es joven, muy joven, querido lector. ¡Quiera
                              Dios revivir con frecuencia esa edad en vuestra alma!...
                              Mientras yo pensaba todavía de ese modo en los hombres más
                              diversos, no tenía más remedio también que acordarme
                              involuntariamente de mi propio panegírico de aquellos
                              tiempos" 
          />
        </div>
            ))}
          </Carousel>
        </div>
      </main> 
    </div>
  );
}