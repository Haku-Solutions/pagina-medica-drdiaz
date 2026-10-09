"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarItem {
  label: string;
  href: string;
  icon: string;
}

interface SidebarProps {
  items?: SidebarItem[];
  logo?: string;
  onNavigate?: () => void;
}

const defaultItems: SidebarItem[] = [
  {
    label: "Inicio",
    href: "/admin/dashboard",
    icon: "/assets/icons/Home.svg",
  },
  {
    label: "Pacientes",
    href: "/admin/pacientes",
    icon: "/assets/icons/usuario.svg",
  },
];

export default function Sidebar({
  items = defaultItems,
  logo = "/assets/logos/logo_drdiaz.svg",
  onNavigate,
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    onNavigate?.();
  };

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={closeMenu}
          className="fixed inset-0 z-40 cursor-default bg-[#1C2B48]/25"
        />
      )}

      <nav
        aria-label="Menú principal"
        className={`fixed left-4 top-4 z-50 flex flex-col overflow-hidden transition-all duration-300 ease-out ${
          isOpen
            ? "max-h-[22rem] w-56 rounded-r-[28px] bg-[linear-gradient(180deg,#72C3FF_0%,#A7C7E7_100%)] p-5 shadow-xl"
            : "max-h-12 w-12 rounded-full bg-white p-0 shadow-md"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isOpen}
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
            isOpen ? "bg-white shadow-sm" : ""
          }`}
        >
          <Image
            src={logo}
            alt="Dr. José Díaz Zacarías"
            width={34}
            height={34}
            priority
            className="h-8 w-8 object-contain"
          />
        </button>

        <ul
          className={`flex flex-col gap-1.5 transition-opacity duration-200 delay-100 ${
            isOpen
              ? "mt-4 pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >
          {items.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-bold transition hover:bg-white/35 ${
                    isActive ? "bg-white/45" : ""
                  }`}
                >
                  <Image
                    src={item.icon}
                    alt=""
                    width={22}
                    height={22}
                    className="h-[22px] w-[22px] shrink-0"
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
