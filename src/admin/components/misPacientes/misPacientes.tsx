"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

interface RespuestaPacientes {
  ok: boolean;
  data?: Paciente[];
  error?: string;
}

export default function MisPacientes() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPacientes = useCallback(async (signal?: AbortSignal) => {
    setCargando(true);
    setError("");

    try {
      const res = await fetch("/api/expedientes", {
        cache: "no-store",
        signal,
      });

      const payload = (await res
        .json()
        .catch(() => null)) as RespuestaPacientes | null;

      if (!res.ok || !payload?.ok || !Array.isArray(payload.data)) {
        throw new Error(
          payload?.error ?? "No se pudieron cargar los pacientes.",
        );
      }

      setPacientes(payload.data);
    } catch (fallo) {
      if (signal?.aborted) return;

      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudieron cargar los pacientes.",
      );
    } finally {
      if (!signal?.aborted) setCargando(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void cargarPacientes(controller.signal);

    return () => controller.abort();
  }, [cargarPacientes]);

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return pacientes;

    return pacientes.filter((paciente) =>
      (paciente.nombreCompleto ?? "").toLowerCase().includes(term),
    );
  }, [busqueda, pacientes]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);

  const visibles = filtrados.slice(
    paginaActual * POR_PAGINA,
    paginaActual * POR_PAGINA + POR_PAGINA,
  );

  const cambiarPagina = (nueva: number) => {
    setPagina(Math.max(0, Math.min(nueva, totalPaginas - 1)));
  };

  const verExpediente = (paciente: Paciente) => {
    router.push(`/admin/ver-expediente/${paciente._id}`);
  };

  return (
    <section className="mis-pacientes">
      <header className="mis-pacientes-header">
        <h1 className="mis-pacientes-title">MIS PACIENTES</h1>
      </header>

      <div className="mis-pacientes-toolbar">
        <div className="mis-pacientes-search">
          <HiMagnifyingGlass className="mis-pacientes-search-icon" />

          <input
            type="search"
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(0);
            }}
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

      {cargando ? (
        <p className="mis-pacientes-empty">Cargando pacientes…</p>
      ) : error ? (
        <div className="mis-pacientes-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="mis-pacientes-retry"
            onClick={() => void cargarPacientes()}
          >
            Reintentar
          </button>
        </div>
      ) : visibles.length === 0 ? (
        <p className="mis-pacientes-empty">
          {pacientes.length === 0
            ? "Todavía no hay pacientes registrados."
            : "No se encontraron pacientes con ese nombre."}
        </p>
      ) : (
        <ul className="mis-pacientes-list">
          {visibles.map((paciente) => (
            <PacienteRow
              key={paciente._id}
              paciente={paciente}
              onVerExpediente={verExpediente}
            />
          ))}
        </ul>
      )}

      {totalPaginas > 1 && (
        <nav className="mis-pacientes-pagination" aria-label="Paginación">
          <button
            type="button"
            className="mis-pacientes-page-arrow"
            onClick={() => cambiarPagina(paginaActual - 1)}
            disabled={paginaActual === 0}
            aria-label="Página anterior"
          >
            <HiChevronLeft />
          </button>

          {Array.from({ length: totalPaginas }, (_, i) => (
            <button
              key={i}
              type="button"
              className={`mis-pacientes-dot ${
                i === paginaActual ? "active" : ""
              }`}
              onClick={() => cambiarPagina(i)}
              aria-label={`Ir a página ${i + 1}`}
              aria-current={i === paginaActual ? "page" : undefined}
            />
          ))}

          <button
            type="button"
            className="mis-pacientes-page-arrow"
            onClick={() => cambiarPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas - 1}
            aria-label="Página siguiente"
          >
            <HiChevronRight />
          </button>
        </nav>
      )}
    </section>
  );
}
