"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  HiChevronLeft,
  HiChevronRight,
  HiDocumentText,
  HiXMark,
} from "react-icons/hi2";
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

const esImagen = (archivo: ArchivoNota) => {
  const formato = archivo.formatoArchivo?.toLowerCase() ?? "";
  if (formato.startsWith("image/")) return true;

  const nombre = (archivo.nombreArchivo ?? archivo.url ?? "").toLowerCase();
  return /\.(png|jpe?g|webp|gif|avif|bmp|svg)$/.test(nombre);
};

const esUrlWeb = (url?: string) => Boolean(url && /^https?:\/\//i.test(url));

export default function VerNota({ id }: VerNotaProps) {
  const [nota, setNota] = useState<NotaOperatoria | null>(null);
  const [archivos, setArchivos] = useState<ArchivoNota[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [intento, setIntento] = useState(0);
  const carruselRef = useRef<HTMLDivElement>(null);
  const [puedeAnterior, setPuedeAnterior] = useState(false);
  const [puedeSiguiente, setPuedeSiguiente] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState<{
    url: string;
    nombre: string;
  } | null>(null);

  const actualizarFlechas = useCallback(() => {
    const carrusel = carruselRef.current;
    if (!carrusel) return;

    const maxScroll = carrusel.scrollWidth - carrusel.clientWidth;
    setPuedeAnterior(carrusel.scrollLeft > 4);
    setPuedeSiguiente(carrusel.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    actualizarFlechas();
    window.addEventListener("resize", actualizarFlechas);

    return () => window.removeEventListener("resize", actualizarFlechas);
  }, [actualizarFlechas, archivos]);

  useEffect(() => {
    if (!imagenAmpliada) return;

    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setImagenAmpliada(null);
    };

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", cerrarConEscape);

    return () => {
      document.body.style.overflow = overflowAnterior;
      window.removeEventListener("keydown", cerrarConEscape);
    };
  }, [imagenAmpliada]);

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

  const imagenes = archivos.filter(esImagen);
  const otrosArchivos = archivos.filter((archivo) => !esImagen(archivo));

  const desplazarCarrusel = (direccion: -1 | 1) => {
    const carrusel = carruselRef.current;
    if (!carrusel) return;

    const primerElemento = carrusel.querySelector<HTMLElement>(
      ".ver-nota-carousel-item",
    );
    const ancho =
      (primerElemento?.getBoundingClientRect().width ?? carrusel.clientWidth) +
      16;

    carrusel.scrollBy({ left: direccion * ancho, behavior: "smooth" });
  };

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
            <>
              {imagenes.length > 0 && (
                <div className="ver-nota-carousel">
                  <div className="ver-nota-carousel-header">
                    <span>Imágenes</span>
                    <span className="ver-nota-carousel-count">
                      {imagenes.length}{" "}
                      {imagenes.length === 1 ? "imagen" : "imágenes"}
                    </span>
                  </div>

                  <div className="ver-nota-carousel-viewport">
                    <div
                      ref={carruselRef}
                      className="ver-nota-carousel-track"
                      role="region"
                      aria-label="Imágenes adjuntas a la nota operatoria"
                      tabIndex={0}
                      onScroll={actualizarFlechas}
                    >
                      {imagenes.map((archivo, index) => {
                        const nombre =
                          archivo.nombreArchivo || `Imagen ${index + 1}`;
                        const url = esUrlWeb(archivo.url) ? archivo.url : "";

                        return (
                          <figure
                            className="ver-nota-carousel-item"
                            key={archivo._id ?? index}
                          >
                            {url ? (
                              <button
                                type="button"
                                className="ver-nota-carousel-image-button"
                                onClick={() =>
                                  setImagenAmpliada({ url, nombre })
                                }
                                aria-label={`Ampliar ${nombre}`}
                                aria-haspopup="dialog"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={url}
                                  alt={nombre}
                                  loading="lazy"
                                  decoding="async"
                                />
                              </button>
                            ) : (
                              <div className="ver-nota-carousel-placeholder">
                                <HiDocumentText aria-hidden="true" />
                                <span>Sin vista previa</span>
                              </div>
                            )}

                            <figcaption className="ver-nota-carousel-caption">
                              <span title={nombre}>{nombre}</span>

                              {url && (
                                <button
                                  type="button"
                                  className="ver-nota-file-link ver-nota-file-link-button"
                                  onClick={() =>
                                    setImagenAmpliada({ url, nombre })
                                  }
                                  aria-haspopup="dialog"
                                >
                                  Ampliar
                                </button>
                              )}
                            </figcaption>
                          </figure>
                        );
                      })}
                    </div>

                    {(puedeAnterior || puedeSiguiente) && (
                      <>
                        <button
                          type="button"
                          className="ver-nota-carousel-arrow ver-nota-carousel-arrow-prev"
                          onClick={() => desplazarCarrusel(-1)}
                          disabled={!puedeAnterior}
                          aria-label="Ver imágenes anteriores"
                        >
                          <HiChevronLeft aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          className="ver-nota-carousel-arrow ver-nota-carousel-arrow-next"
                          onClick={() => desplazarCarrusel(1)}
                          disabled={!puedeSiguiente}
                          aria-label="Ver imágenes siguientes"
                        >
                          <HiChevronRight aria-hidden="true" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {otrosArchivos.length > 0 && (
                <div className="ver-nota-documentos">
                  {imagenes.length > 0 && (
                    <p className="ver-nota-subtitulo">Documentos</p>
                  )}

                  <ul className="nota-file-list">
                    {otrosArchivos.map((archivo, index) => (
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
                </div>
              )}
            </>
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

      {imagenAmpliada && (
        <div
          className="ver-nota-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setImagenAmpliada(null);
            }
          }}
        >
          <div
            className="ver-nota-modal-contenido"
            role="dialog"
            aria-modal="true"
            aria-label={`Imagen ampliada: ${imagenAmpliada.nombre}`}
          >
            <div className="ver-nota-modal-header">
              <span className="ver-nota-modal-titulo">
                {imagenAmpliada.nombre}
              </span>

              <button
                type="button"
                className="ver-nota-modal-cerrar"
                onClick={() => setImagenAmpliada(null)}
                aria-label="Cerrar imagen"
                autoFocus
              >
                <HiXMark aria-hidden="true" />
              </button>
            </div>

            <div className="ver-nota-modal-imagen">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagenAmpliada.url}
                alt={imagenAmpliada.nombre}
                decoding="async"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
