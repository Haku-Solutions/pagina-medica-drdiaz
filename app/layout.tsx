import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { testimonials } from "@/src/styles/components/testimonialCard/testimonials";
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
  metadataBase: new URL('https://drjosediazzacarias.com'), 
  openGraph: {
    title: 'Dr. José Díaz | Cirujano General y Laparoscopista',
    description: 'Atención médica quirúrgica especializada y de mínima invasión.',
    url: 'https://drjosediazzacarias.com', 
    siteName: 'Dr. José Díaz - Cirugía General',
    images: [
      {
        url: '/assets/og/og-image.png', 
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
  twitter: {
    card: 'summary_large_image',
    title: 'Dr. José Díaz | Cirujano General y Laparoscopista',
    description: 'Especialista en cirugía general y de mínima invasión (laparoscopía). Más de 20 años de experiencia en Acapulco y Costa Chica de Guerrero.',
    images: ['/assets/og/og-image.png'],
  },
  alternates: {
    canonical: 'https://drjosediazzacarias.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    '@id': 'https://drjosediazzacarias.com/#physician',
    name: 'Dr. José Díaz Zacarías',
    description:
      'Cirujano General y Laparoscopista con más de 20 años de experiencia en cirugía de mínima invasión.',
    url: 'https://drjosediazzacarias.com',
    image: 'https://drjosediazzacarias.com/assets/logos/logo_drdiaz.svg',
    sameAs: ['https://www.facebook.com/profile.php?id=61592800274943'],
    medicalSpecialty: [
      'Cirugía General',
      'Laparoscopía',
      'Endoscopia',
    ],
    knowsAbout: [
      'Cirugía de Vesícula Biliar',
      'Cirugía de Hernias',
      'Cirugía de Apendicitis',
      'Cirugía de Obstrucción Intestinal',
      'Cirugía de Pie Diabético',
      'Endoscopia Digestiva',
    ],
    hasCredential: [
      {
        '@type': 'EducationalOccupationalCredential',
        credentialCategory: 'Cédula Profesional',
        name: 'Cédula Profesional 12345677',
      },
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Acapulco',
      addressRegion: 'Guerrero',
      addressCountry: 'MX',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 16.8531,
      longitude: -99.8237,
    },
    areaServed: [
      {
        '@type': 'GeoCircle',
        name: 'Costa Chica de Guerrero y Acapulco',
      },
    ],
    memberOf: [
      {
        '@type': 'MedicalOrganization',
        name: 'Consejo Mexicano de Cirugía General',
      },
    ],
    review: testimonials.map((testimonial) => ({
      '@type': 'Review',
      reviewBody: testimonial.text,
      author: {
        '@type': 'Person',
        name: testimonial.author,
      },
    })),
  };

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
