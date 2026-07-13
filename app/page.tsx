import Image from "next/image";
import WhatsAppButton from "@/src/styles/components/contactButton/contactButton";
import NavBar from "@/src/styles/components/navBar/navBar";
import { Carousel } from "@/src/styles/components/carousel/carousel";

export default function Home() {
    const servicios = [
    {
      id: 1,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/image_1838de.jpg", // Reemplaza por la ruta de tu imagen escalada
    },
    {
      id: 2,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/image_1838de.jpg",
    },
    {
      id: 3,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/image_1838de.jpg",
    },
    {
      id: 4,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/image_1838de.jpg",
    },
    {
      id: 5,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/image_1838de.jpg",
    },
    {
      id: 6,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      imagen: "/image_1838de.jpg",
    },
    {
      id: 7,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
    },
    {
      id: 8,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
    },
      {
      id: 9,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      },
      {
      id: 10,
      titulo: "Cirugía de Vesícula Biliar",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",
      },
      {
      id: 11,
      titulo: "LMO SDSDSD",
      descripcion: "Puede necesitar esta cirugía si tiene dolor u otros síntomas a raíz de los cálculos biliares.",

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
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Test Darius King
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
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
                    <h2 className="text-4xl font-bold text-[#0D1B2A] tracking-tight">Servicios</h2>
          <p className="text-sky-600 font-semibold mb-10 text-sm tracking-wide uppercase">Atención general y quirúrgica</p>
<Carousel itemsPerPage={3}>
            {servicios.map((servicio) => (
              <div 
                key={servicio.id} 
                className="flex flex-col bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden h-full transition-transform hover:scale-[1.01]"
              >
                <div className="relative w-full h-64 bg-zinc-100">
                  <Image
                    src={servicio.imagen}
                    alt={servicio.titulo}
                    fill
                    className="object-cover object-center p-2 rounded-2xl"
                  />
                </div>
                <div className="p-6 flex flex-col justify-between flex-1">
                  <h3 className="text-xl font-bold text-[#0D1B2A] mb-3">{servicio.titulo}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed italic">{servicio.descripcion}</p>
                </div>
              </div>
            ))}
          </Carousel>
         </div>
      </main>
    </div>
  );
}
