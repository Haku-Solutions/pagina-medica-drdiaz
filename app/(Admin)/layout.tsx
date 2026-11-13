import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/src/admin/components/Sidebar";
import PwaRegistrar from "@/src/admin/components/PwaRegistrar";
import { getSessionUser } from "@/src/server/auth/requireSession";
import "../globals.css";

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
    default: "Mis Pacientes | Dr. José Díaz",
    template: "%s | Dr. José Díaz",
  },
  robots: {
    index: false,
    follow: false,
  },
  manifest: "/admin/manifest.webmanifest",
  applicationName: "Portal Médico Dr. Díaz",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Portal Médico",
  },
  formatDetection: {
    telephone: false,
  },
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionUser();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PwaRegistrar />
        {session ? <Sidebar /> : null}
        {children}
      </body>
    </html>
  );
}
