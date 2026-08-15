import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'Dr. José Díaz | Cirujano General y Laparoscopista',
    template: '%s | Dr. José Díaz',
  },
  description: 'Especialista en cirugía general y de mínima invasión (laparoscopía). Cirugía de vesícula biliar, hernias y apendicitis con rápida recuperación.',
  keywords: [
    'Cirujano General',
    'Cirugía de Vesícula Biliar',
    'Laparoscopía',
    'Cirugía Mínima Invasión',
    'Dr. José Díaz',
    'Consulta médica',
    'Cirujano certificado',
    'Cirugía de Hernias',
    'Cirugía de Apendicitis',
    'Recuperación rápida',
    'Tratamiento médico especializado',
    'Atención quirúrgica profesional',
    'Cirugía segura y efectiva',
    'Cirugía laparoscópica avanzada',
    'Cirugía de alta calidad',
    'Cirugía con experiencia',
    'Cirugía con ética profesional',
    'Cirugía con resultados exitosos',
  ],
  authors: [{ name: 'Dr. José Díaz' }],
  creator: 'Dr. José Díaz',
  metadataBase: new URL('https://midominio.com'), // Cuando se tenga el dominio real remplazar | Vista previa en links compartidos
  openGraph: {
    title: 'Dr. José Díaz | Cirujano General y Laparoscopista',
    description: 'Atención médica quirúrgica especializada y de mínima invasión.',
    url: 'https://midominio.com', // Cuando se tenga el dominio real remplazar | Vista previa en links compartidos
    siteName: 'Dr. José Díaz - Cirugía General',
    images: [
      {
        url: '/og-image.jpg', // Imagen de 1200x630px en la carpeta public
        width: 1200,
        height: 630,
        alt: 'Dr. José Díaz - Cirujano General',
      },
    ],
    locale: 'es_MX',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
