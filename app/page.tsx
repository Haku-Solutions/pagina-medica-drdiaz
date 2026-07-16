import Image from "next/image";
import WhatsAppButton from "@/src/styles/components/contactButton/contactButton";
import NavBar from "@/src/styles/components/navBar/navBar";
import FlipCard from "@/src/styles/components/flipCard/flipCard";
import { Carousel } from "@/src/styles/components/carousel/carousel";

export default function Home() {
  const servicios = [
    {
      id: 1,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 2,
      titulo: "Cirugía de Vesícula Biliar 1",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 3,
      titulo: "Cirugía de Vesícula Biliar 2",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 4,
      titulo: "Cirugía de Vesícula Biliar 3",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 5,
      titulo: "Cirugía de Vesícula Biliar 4",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 6,
      titulo: "Cirugía de Vesícula Biliar 5",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 7,
      titulo: "Cirugía de Vesícula Biliar 6",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg", // Fallback para evitar errores de renderizado de Next.js
    },
    {
      id: 8,
      titulo: "Cirugía de Vesícula Biliar 7",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 9,
      titulo: "Cirugía de Vesícula Biliar 8",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 10,
      titulo: "Cirugía de Vesícula Biliar 9",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    },
    {
      id: 11,
      titulo: "Cirugía de Vesícula Biliar 10",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/assets/servicios/default.jpg",
    }
  ];

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

        <WhatsAppButton
          phone=""
          message="Hola. Me gustaría agendar una cita."
        />

        {/* Sección de visualización del Carrusel con las FlipCards de tu colega */}
        <div className="w-full mt-12">
          <h2 className="text-4xl font-bold text-[#0D1B2A] tracking-tight">Servicios</h2>
          <p className="text-sky-600 font-semibold mb-10 text-sm tracking-wide uppercase">Atención general y quirúrgica</p>
          
          <Carousel itemsPerPage={4}>
            {servicios.map((servicio) => (
              <div key={servicio.id} className="flex justify-center p-2">
                <FlipCard
                  imageSrc={servicio.imagen}
                  imageAlt={servicio.titulo}
                  title={servicio.titulo}
                  description={servicio.descripcion}
                />
              </div>
            ))}
          </Carousel>
        </div>
      </main>
    </div>
  );
}