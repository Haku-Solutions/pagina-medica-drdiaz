"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiMagnifyingGlass,
  HiChevronLeft,
  HiChevronRight,
  HiPlus,
} from "react-icons/hi2";
import PacienteRow from "./pacienteRow";
import type { Paciente } from "./pacientes";
import "./misPacientes.css";

const POR_PAGINA = 10;
const ESPERA_BUSQUEDA = 300;

interface RespuestaPacientes {
  pacientes: Paciente[];
  total: number;
  pagina: number;
  totalPaginas: number;
  porPagina: number;
}

export default function MisPacientes() {
  const router = useRouter();

  const [busqueda, setBusqueda] = useState("");
  const [termino, setTermino] = useState("");
  const [pagina, setPagina] = useState(1);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Espera a que el usuario deje de escribir antes de buscar.
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTermino(busqueda.trim());
      setPagina(1);
    }, ESPERA_BUSQUEDA);

    return () => clearTimeout(timeout);
  }, [busqueda]);

  const cargar = useCallback(
    async (busquedaActual: string, paginaActual: number) => {
      setCargando(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          pagina: String(paginaActual),
          porPagina: String(POR_PAGINA),
        });
        if (busquedaActual) params.set("busqueda", busquedaActual);

        const respuesta = await fetch(`/api/pacientes?${params.toString()}`);
        const json = await respuesta.json().catch(() => null);

        if (respuesta.status === 401) {
          router.replace("/admin/login");
          return;
        }

        if (!respuesta.ok || !json?.ok) {
          setPacientes([]);
          setTotalPaginas(1);
          setError(json?.error ?? "No se pudieron cargar los pacientes.");
          return;
        }

        const data = json.data as RespuestaPacientes;
        setPacientes(data.pacientes);
        setTotalPaginas(data.totalPaginas);
        setPagina((actual) => (actual === data.pagina ? actual : data.pagina));
      } catch {
        setPacientes([]);
        setTotalPaginas(1);
        setError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    },
    [router]
  );

  useEffect(() => {
    cargar(termino, pagina);
  }, [termino, pagina, cargar]);

  const cambiarPagina = (nueva: number) => {
    setPagina(Math.max(1, Math.min(nueva, totalPaginas)));
  };

  return (
    <section className="mis-pacientes">
      <header className="mis-pacientes-header">
        <button
          type="button"
          className="mis-pacientes-logo-btn"
          aria-label="Dr. José Díaz Zacarías"
        >
          <Image
            src="/assets/logos/logo_drdiaz.svg"
            alt="Dr. José Díaz Zacarías"
            width={56}
            height={56}
            className="mis-pacientes-logo"
          />
        </button>

        <h1 className="mis-pacientes-title">Mis Pacientes</h1>
      </header>

      <div className="mis-pacientes-toolbar">
        <div className="mis-pacientes-search">
          <HiMagnifyingGlass className="mis-pacientes-search-icon" />

          <input
            type="search"
            value={busqueda}
            onChange={(event) => setBusqueda(event.target.value)}
            placeholder="Buscar paciente"
            aria-label="Buscar paciente"
            className="mis-pacientes-input"
          />
        </div>

        <button
          type="button"
          className="mis-pacientes-create"
          onClick={() => router.push("/admin/crear-expediente")}
        >
          <HiPlus className="mis-pacientes-create-icon" />

          <span>Crear expediente</span>
        </button>
      </div>

      {cargando && <p className="mis-pacientes-empty">Cargando pacientes…</p>}

      {!cargando && error && (
        <div className="mis-pacientes-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            onClick={() => cargar(termino, pagina)}
            className="mis-pacientes-retry"
          >
            Reintentar
          </button>
        </div>
      )}

      {!cargando && !error && pacientes.length === 0 && (
        <p className="mis-pacientes-empty">
          {termino
            ? "No se encontraron pacientes con ese nombre."
            : "Todavía no tienes pacientes registrados."}
        </p>
      )}

      {!cargando && !error && pacientes.length > 0 && (
        <ul className="mis-pacientes-list">
          {pacientes.map((paciente) => (
            <PacienteRow key={paciente._id} paciente={paciente} />
          ))}
        </ul>
      )}

      {!cargando && !error && totalPaginas > 1 && (
        <nav className="mis-pacientes-pagination" aria-label="Paginación">
          <button
            type="button"
            className="mis-pacientes-page-arrow"
            onClick={() => cambiarPagina(pagina - 1)}
            disabled={pagina <= 1}
            aria-label="Página anterior"
          >
            <HiChevronLeft />
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`mis-pacientes-dot ${
                i + 1 === pagina ? "active" : ""
              }`}
              onClick={() => cambiarPagina(i + 1)}
              aria-label={`Página ${i + 1}`}
              aria-current={i + 1 === pagina ? "page" : undefined}
            />
          ))}

          <button
            type="button"
            className="mis-pacientes-page-arrow"
            onClick={() => cambiarPagina(pagina + 1)}
            disabled={pagina >= totalPaginas}
            aria-label="Página siguiente"
          >
            <HiChevronRight />
          </button>
        </nav>
      )}
    </section>
  );
}
