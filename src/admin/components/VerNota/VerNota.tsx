"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { HiDocumentText } from "react-icons/hi2";
import "../CrearNota/CrearNota.css";
import "./VerNota.css";

interface NotaOperatoria {
  _id?: string;
  idExpediente?: string;
  fechaCirugia?: string;
  lugarCirugia?: string;
  notaPreoperatoria?: string;
  notaPostoperatoria?: string;
  diagnosticoPreoperatorio?: string;
  diagnosticoPostoperatorio?: string;
  cirugiaProgramada?: string;
  cirugiaRealizada?: string;
  hallazgos?: string;
  tecnica?: string;
  sangrado?: string;
  drenajes?: string;
  materialesTextiles?: string;
  complicaciones?: string;
  anestesiologo?: string;
  tipoAnestesia?: string;
  enfermeraInstrumentista?: string;
  enfermeraCirculante?: string;
  ayudantes?: string;
  plan?: string;
  pronostico?: string;
  dieta?: string;
  soluciones?: string;
  medicamentos?: string;
  cuidadosGenerales?: string;
}

interface ArchivoNota {
  _id?: string;
  nombreArchivo?: string;
  formatoArchivo?: string;
  url?: string;
}

interface RespuestaNota {
  ok: boolean;
  data?: {
    nota?: NotaOperatoria;
    archivos?: ArchivoNota[];
  };
  error?: string;
}

interface VerNotaProps {
  id: string;
}

function Campo({
  id,
  label,
  className = "",
  children,
}: {
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`nota-field ${className}`.trim()}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}

const texto = (valor?: string | number | null) =>
  valor === undefined || valor === null ? "" : String(valor);

const fechaParaInput = (valor?: string) => {
  if (!valor) return "";

  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return "";

  return fecha.toISOString().slice(0, 10);
};

export default function VerNota({ id }: VerNotaProps) {
  const [nota, setNota] = useState<NotaOperatoria | null>(null);
  const [archivos, setArchivos] = useState<ArchivoNota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    const cargar = async () => {
      setCargando(true);
      setError("");

      try {
        const res = await fetch(`/api/notas/${encodeURIComponent(id)}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await res
          .json()
          .catch(() => null)) as RespuestaNota | null;

        if (!res.ok || !payload?.ok || !payload.data?.nota) {
          throw new Error(
            payload?.error ?? "No se pudo cargar la nota operatoria.",
          );
        }

        setNota(payload.data.nota);
        setArchivos(payload.data.archivos ?? []);
      } catch (fallo) {
        if (controller.signal.aborted) return;

        setError(
          fallo instanceof Error
            ? fallo.message
            : "No se pudo cargar la nota operatoria.",
        );
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    };

    void cargar();

    return () => controller.abort();
  }, [id, intento]);

  if (cargando) {
    return (
      <div className="crear-nota-shell ver-nota-estado" aria-busy="true">
        <p>Cargando nota operatoria…</p>
      </div>
    );
  }

  if (error || !nota) {
    return (
      <div className="crear-nota-shell ver-nota-estado">
        <p className="ver-nota-error" role="alert">
          {error || "No se encontró la nota operatoria."}
        </p>

        <div className="ver-nota-estado-acciones">
          <button type="button" onClick={() => setIntento((valor) => valor + 1)}>
            Reintentar
          </button>

          <Link href="/admin/mispacientes">Volver a Mis Pacientes</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="crear-nota-shell ver-nota-shell">
      <div className="crear-nota-form">
        <header className="crear-nota-header">
          <h1>Ver Nota Operatoria</h1>
        </header>

        <section className="nota-section">
          <div className="nota-section-heading">
            <span>01</span>
            <h2>Datos de la Cirugía</h2>
          </div>

          <div className="nota-fields-grid">
            <Campo id="fechaCirugia" label="Fecha de la Cirugía">
              <input
                id="fechaCirugia"
                type="date"
                className="nota-date-input"
                value={fechaParaInput(nota.fechaCirugia)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="lugarCirugia" label="Lugar de la Cirugía">
              <input
                id="lugarCirugia"
                type="text"
                value={texto(nota.lugarCirugia)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="notaPreoperatoria" label="Nota Preoperatoria">
              <input
                id="notaPreoperatoria"
                type="text"
                value={texto(nota.notaPreoperatoria)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="notaPostoperatoria" label="Nota Postoperatoria">
              <input
                id="notaPostoperatoria"
                type="text"
                value={texto(nota.notaPostoperatoria)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo
              id="diagnosticoPreoperatorio"
              label="Diagnóstico Preoperatorio"
            >
              <input
                id="diagnosticoPreoperatorio"
                type="text"
                value={texto(nota.diagnosticoPreoperatorio)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo
              id="diagnosticoPostoperatorio"
              label="Diagnóstico Postoperatorio"
            >
              <input
                id="diagnosticoPostoperatorio"
                type="text"
                value={texto(nota.diagnosticoPostoperatorio)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="cirugiaProgramada" label="Cirugía Programada">
              <input
                id="cirugiaProgramada"
                type="text"
                value={texto(nota.cirugiaProgramada)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="cirugiaRealizada" label="Cirugía Realizada">
              <input
                id="cirugiaRealizada"
                type="text"
                value={texto(nota.cirugiaRealizada)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo
              id="hallazgos"
              label="Hallazgos"
              className="nota-field-wide"
            >
              <textarea
                id="hallazgos"
                rows={4}
                value={texto(nota.hallazgos)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="tecnica" label="Técnica">
              <input
                id="tecnica"
                type="text"
                value={texto(nota.tecnica)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="sangrado" label="Sangrado">
              <input
                id="sangrado"
                type="text"
                value={texto(nota.sangrado)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="drenajes" label="Drenajes">
              <input
                id="drenajes"
                type="text"
                value={texto(nota.drenajes)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo
              id="materialesTextiles"
              label="Cuenta de Materiales y Textiles"
            >
              <input
                id="materialesTextiles"
                type="text"
                value={texto(nota.materialesTextiles)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="complicaciones" label="Complicaciones">
              <input
                id="complicaciones"
                type="text"
                value={texto(nota.complicaciones)}
                readOnly
                tabIndex={-1}
              />
            </Campo>
          </div>
        </section>

        <section className="nota-section">
          <div className="nota-section-heading">
            <span>02</span>
            <h2>Equipo de la Cirugía</h2>
          </div>

          <div className="nota-fields-grid">
            <Campo id="anestesiologo" label="Anestesiólogo">
              <input
                id="anestesiologo"
                type="text"
                value={texto(nota.anestesiologo)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="tipoAnestesia" label="Tipo de Anestesia">
              <input
                id="tipoAnestesia"
                type="text"
                value={texto(nota.tipoAnestesia)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo
              id="enfermeraInstrumentista"
              label="Enfermera Instrumentista"
            >
              <input
                id="enfermeraInstrumentista"
                type="text"
                value={texto(nota.enfermeraInstrumentista)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="enfermeraCirculante" label="Enfermera Circulante">
              <input
                id="enfermeraCirculante"
                type="text"
                value={texto(nota.enfermeraCirculante)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="ayudantes" label="Ayudantes">
              <input
                id="ayudantes"
                type="text"
                value={texto(nota.ayudantes)}
                readOnly
                tabIndex={-1}
              />
            </Campo>
          </div>
        </section>

        <section className="nota-section">
          <div className="nota-section-heading">
            <span>03</span>
            <h2>Indicaciones Postoperatorias</h2>
          </div>

          <div className="nota-fields-grid">
            <Campo id="plan" label="Plan">
              <textarea
                id="plan"
                rows={4}
                value={texto(nota.plan)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="pronostico" label="Pronóstico">
              <textarea
                id="pronostico"
                rows={4}
                value={texto(nota.pronostico)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="dieta" label="Dieta">
              <textarea
                id="dieta"
                rows={4}
                value={texto(nota.dieta)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="soluciones" label="Soluciones">
              <textarea
                id="soluciones"
                rows={4}
                value={texto(nota.soluciones)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo id="medicamentos" label="Medicamentos">
              <textarea
                id="medicamentos"
                rows={4}
                value={texto(nota.medicamentos)}
                readOnly
                tabIndex={-1}
              />
            </Campo>

            <Campo
              id="cuidadosGenerales"
              label="Cuidados Generales de Enfermería"
            >
              <textarea
                id="cuidadosGenerales"
                rows={4}
                value={texto(nota.cuidadosGenerales)}
                readOnly
                tabIndex={-1}
              />
            </Campo>
          </div>
        </section>

        <section className="nota-section nota-files-section">
          <div className="nota-section-heading">
            <span>04</span>
            <h2>Archivos Adjuntos</h2>
          </div>

          {archivos.length > 0 ? (
            <ul className="nota-file-list">
              {archivos.map((archivo, index) => (
                <li key={archivo._id ?? index}>
                  <HiDocumentText aria-hidden="true" />
                  <span>{archivo.nombreArchivo || "Archivo"}</span>

                  {archivo.url && (
                    <a
                      className="ver-nota-file-link"
                      href={archivo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="ver-nota-sin-archivos">Sin archivos adjuntos.</p>
          )}
        </section>

        <footer className="nota-form-actions">
          <Link
            href={
              nota.idExpediente
                ? `/admin/ver-expediente/${nota.idExpediente}`
                : "/admin/mispacientes"
            }
            className="ver-nota-back"
          >
            Atrás
          </Link>
        </footer>
      </div>
    </div>
  );
}
