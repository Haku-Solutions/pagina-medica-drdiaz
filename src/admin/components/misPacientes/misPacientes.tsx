  "use client";
  import { useMemo, useState } from "react";
  import Image from "next/image";
  import { useRouter } from "next/navigation";
  import {
    HiMagnifyingGlass,
    HiChevronLeft,
    HiChevronRight,
    HiPlus,
  } from "react-icons/hi2";
  import PacienteRow from "./pacienteRow";
  import { pacientes } from "./pacientes";
  import "./misPacientes.css";


const POR_PAGINA = 10;

export default function MisPacientes() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(0);

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    if (!term) return pacientes;

    return pacientes.filter((paciente) =>
      paciente.nombre.toLowerCase().includes(term),
    );
  }, [busqueda]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas - 1);

  const visibles = filtrados.slice(
    paginaActual * POR_PAGINA,
    paginaActual * POR_PAGINA + POR_PAGINA,
  );

  const cambiarPagina = (nueva: number) => {
    setPagina(Math.max(0, Math.min(nueva, totalPaginas - 1)));
  };

  return (
    <section className="mis-pacientes">
      <header className="mis-pacientes-header">
        <button
          type="button"
          className="mis-pacientes-logo-btn"
          aria-label="Abrir menú lateral"
        >
          <Image
            src="/assets/logos/logo_drdiaz.svg"
            alt="Dr. José Díaz"
            width={56}
            height={56}
            className="mis-pacientes-logo"
          />
        </button>

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

        <button type="button" className="mis-pacientes-create"  onClick={() => router.push("/admin/crear-expediente")}>
          <HiPlus className="mis-pacientes-create-icon" />

          <span>Crear expediente</span>
        </button>
      </div>

      {visibles.length === 0 ? (
        <p className="mis-pacientes-empty">
          No se encontraron pacientes con ese nombre.
        </p>
      ) : (
        <ul className="mis-pacientes-list">
          {visibles.map((paciente) => (
            <PacienteRow key={paciente.id} paciente={paciente} />
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
