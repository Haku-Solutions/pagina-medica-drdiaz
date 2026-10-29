"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import "../CrearExpediente/CrearExpediente.css";
import "./VerExpediente.css";

interface Expediente {
  _id?: string;
  nombreCompleto?: string;
  fechaNacimiento?: string;
  sexo?: "M" | "F";
  antecedentes?: string;
  edad?: number;
  estado?: string;
  municipio?: string;
  curp?: string;
  lugarResidencia?: string;
  telefono?: number;
  familiarResponsable?: string;
  telefonoFamiliar?: number;
  createdAt?: string;
}

interface RespuestaExpediente {
  ok: boolean;
  data?: {
    expediente?: Expediente;
  };
  error?: string;
}

interface VerExpedienteProps {
  id: string;
}

function Campo({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="crear-expediente-field">
      <label htmlFor={id} className="crear-expediente-label">
        {label}
      </label>

      {children}
    </div>
  );
}

const texto = (valor: string | number | null | undefined) => {
  if (valor === null || valor === undefined) return "";

  return String(valor);
};

const fechaParaInput = (valor?: string) => {
  if (!valor) return "";

  return valor.slice(0, 10);
};

const formatearIngreso = (valor?: string) => {
  if (!valor) return null;

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return null;

  return {
    fecha: fecha.toLocaleDateString("es-MX", {
      timeZone: "America/Mexico_City",
    }),
    hora: fecha.toLocaleTimeString("es-MX", {
      hour12: true,
      timeZone: "America/Mexico_City",
    }),
  };
};

export default function VerExpediente({ id }: VerExpedienteProps) {
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setCargando(true);
      setError("");

      try {
        const res = await fetch(`/api/expedientes/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await res
          .json()
          .catch(() => null)) as RespuestaExpediente | null;

        if (!res.ok || !payload?.ok || !payload.data?.expediente) {
          throw new Error(
            payload?.error ?? "No se pudo cargar el expediente.",
          );
        }

        setExpediente(payload.data.expediente);
      } catch (fallo) {
        if (controller.signal.aborted) return;

        setError(
          fallo instanceof Error
            ? fallo.message
            : "No se pudo cargar el expediente.",
        );
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    };

    void cargar();

    return () => controller.abort();
  }, [id]);

  if (cargando) {
    return (
      <section className="crear-expediente ver-expediente">
        <div className="ver-expediente-estado">
          <p>Cargando expediente…</p>
        </div>
      </section>
    );
  }

  if (error || !expediente) {
    return (
      <section className="crear-expediente ver-expediente">
        <div className="ver-expediente-estado">
          <p className="ver-expediente-error" role="alert">
            {error || "No se encontró el expediente."}
          </p>

          <Link
            href="/admin/mispacientes"
            className="crear-expediente-btn crear-expediente-btn-back"
          >
            Volver a pacientes
          </Link>
        </div>
      </section>
    );
  }

  const ingreso = formatearIngreso(expediente.createdAt);
  const sexoSeleccionado =
    expediente.sexo === "M"
      ? "Hombre"
      : expediente.sexo === "F"
        ? "Mujer"
        : null;

  return (
    <section className="crear-expediente ver-expediente">
      <div className="crear-expediente-card">
        <header className="crear-expediente-header">
          <h1 className="crear-expediente-title">Ver Expediente</h1>
        </header>

        <div className="crear-expediente-ingreso">
          <p>
            <strong>Fecha de Ingreso</strong>{" "}
            <span>{ingreso?.fecha ?? "No registrado"}</span>
          </p>
          <p>
            <strong>Hora de Ingreso</strong>{" "}
            <span>{ingreso?.hora ?? "No registrado"}</span>
          </p>
        </div>

        <h2 className="crear-expediente-section">1. Datos del Paciente</h2>

        <Campo id="nombre" label="Nombre Completo">
          <input
            id="nombre"
            type="text"
            value={texto(expediente.nombreCompleto)}
            readOnly
            className="crear-expediente-input"
          />
        </Campo>

        <Campo id="fechaNacimiento" label="Fecha de Nacimiento">
          <input
            id="fechaNacimiento"
            type="date"
            value={fechaParaInput(expediente.fechaNacimiento)}
            readOnly
            className="crear-expediente-input crear-expediente-input-short"
          />
        </Campo>

        <Campo id="edad" label="Edad">
          <input
            id="edad"
            type="text"
            value={texto(expediente.edad)}
            readOnly
            tabIndex={-1}
            className="crear-expediente-input crear-expediente-input-tiny"
          />
        </Campo>

        <fieldset className="crear-expediente-field crear-expediente-sexo m-20">
          <legend className="crear-expediente-label">Sexo</legend>

          {sexoSeleccionado ? (
            <span className="ver-expediente-sexo-opcion">
              <span className="ver-expediente-sexo-punto" aria-hidden="true" />
              <span>{sexoSeleccionado}</span>
            </span>
          ) : (
            <span className="ver-expediente-sexo-vacio">No registrado</span>
          )}
        </fieldset>

        <Campo id="ciudadNacimiento" label="Ciudad (Lugar de Nacimiento)">
          <input
            id="ciudadNacimiento"
            type="text"
            value={texto(expediente.municipio)}
            readOnly
            className="crear-expediente-input"
          />
        </Campo>

        <Campo id="estadoNacimiento" label="Estado (Lugar de Nacimiento)">
          <input
            id="estadoNacimiento"
            type="text"
            value={texto(expediente.estado)}
            readOnly
            className="crear-expediente-input"
          />
        </Campo>

        <Campo id="curp" label="CURP">
          <input
            id="curp"
            type="text"
            value={texto(expediente.curp)}
            readOnly
            className="crear-expediente-input"
          />
        </Campo>

        <Campo id="residencia" label="Lugar de Residencia">
          <input
            id="residencia"
            type="text"
            value={texto(expediente.lugarResidencia)}
            readOnly
            className="crear-expediente-input"
          />
        </Campo>

        <Campo id="antecedentes" label="Antecedentes">
          <textarea
            id="antecedentes"
            value={texto(expediente.antecedentes)}
            readOnly
            className="crear-expediente-input crear-expediente-textarea"
            rows={5}
          />
        </Campo>

        <Campo id="telefono" label="Teléfono">
          <input
            id="telefono"
            type="tel"
            value={texto(expediente.telefono)}
            readOnly
            className="crear-expediente-input"
          />
        </Campo>

        <h2 className="crear-expediente-section">
          2. Datos del Familiar responsable
        </h2>

        <Campo
          id="familiarNombre"
          label="Nombre Completo del Familiar Responsable"
        >
          <input
            id="familiarNombre"
            type="text"
            value={texto(expediente.familiarResponsable)}
            readOnly
            className="crear-expediente-input"
          />
        </Campo>

        <Campo
          id="familiarTelefono"
          label="Teléfono del Familiar Responsable"
        >
          <input
            id="familiarTelefono"
            type="tel"
            value={texto(expediente.telefonoFamiliar)}
            readOnly
            className="crear-expediente-input"
          />
        </Campo>

        <div className="ver-expediente-acciones">
          <Link
            href="/admin/mispacientes"
            className="crear-expediente-btn crear-expediente-btn-back"
          >
            Atrás
          </Link>

          <button
            type="button"
            className="crear-expediente-btn ver-expediente-btn-editar"
          >
            Editar Expediente
          </button>

          <button
            type="button"
            className="crear-expediente-btn ver-expediente-btn-imprimir"
          >
            Imprimir Expediente
          </button>
        </div>

        <div className="ver-expediente-bitacoras">
          <h2 className="ver-expediente-bitacoras-titulo">
            Bitácoras Registradas
          </h2>

          <button
            type="button"
            className="crear-expediente-btn ver-expediente-btn-bitacora"
          >
            Crear Bitácora
          </button>
        </div>
      </div>
    </section>
  );
}
