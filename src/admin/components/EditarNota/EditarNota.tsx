"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { resumenErroresCampos } from "@/src/admin/utils/formValidation";
import { HiChevronLeft, HiChevronRight, HiDocumentText, HiXMark } from "react-icons/hi2";
import FileDropzone, { type DropzoneFile } from "../fileDropzone/fileDropzone";
import type { NotaOperatoriaForm } from "../CrearNota/CrearNota";
import { cirugias, lugaresCirugia } from "../CrearNota/mocks/notaOperatoria.mock";
import "../CrearNota/CrearNota.css";
import "../VerNota/VerNota.css";

type NotaGuardada = Partial<NotaOperatoriaForm> & {
  _id: string;
  idExpediente: string;
};

interface ArchivoNota {
  _id: string;
  nombreArchivo: string;
  formatoArchivo: string;
  url: string;
}

interface ImagenCarrusel {
  id: string;
  nombre: string;
  url: string;
  deleting: boolean;
}

interface ArchivoNuevo {
  id: string;
  file: File;
  previewUrl?: string;
}

interface RespuestaNota {
  ok: boolean;
  data?: { nota?: NotaGuardada; archivos?: ArchivoNota[] };
  error?: string;
}

interface EditarNotaProps {
  id: string;
}

type FieldName = keyof NotaOperatoriaForm;
type FieldConfig = { name: FieldName; label: string; kind?: "date" | "textarea" | "place" | "surgery"; wide?: boolean };

const fields: { title: string; items: FieldConfig[] }[] = [
  { title: "Datos de la Cirugía", items: [
    { name: "fechaCirugia", label: "Fecha de la Cirugía", kind: "date" },
    { name: "lugarCirugia", label: "Lugar de la Cirugía", kind: "place" },
    { name: "notaPreoperatoria", label: "Nota Preoperatoria" },
    { name: "notaPostoperatoria", label: "Nota Postoperatoria" },
    { name: "diagnosticoPreoperatorio", label: "Diagnóstico Preoperatorio" },
    { name: "diagnosticoPostoperatorio", label: "Diagnóstico Postoperatorio" },
    { name: "cirugiaProgramada", label: "Cirugía Programada", kind: "surgery" },
    { name: "cirugiaRealizada", label: "Cirugía Realizada", kind: "surgery" },
    { name: "hallazgos", label: "Hallazgos", kind: "textarea", wide: true },
    { name: "tecnica", label: "Técnica" },
    { name: "sangrado", label: "Sangrado" },
    { name: "drenajes", label: "Drenajes" },
    { name: "materialesTextiles", label: "Cuenta de Materiales y Textiles" },
    { name: "complicaciones", label: "Complicaciones" },
  ] },
  { title: "Equipo de la Cirugía", items: [
    { name: "anestesiologo", label: "Anestesiólogo" },
    { name: "tipoAnestesia", label: "Tipo de Anestesia" },
    { name: "enfermeraInstrumentista", label: "Enfermera Instrumentista" },
    { name: "enfermeraCirculante", label: "Enfermera Circulante" },
    { name: "ayudantes", label: "Ayudantes" },
  ] },
  { title: "Indicaciones Postoperatorias", items: [
    { name: "plan", label: "Plan", kind: "textarea" },
    { name: "pronostico", label: "Pronóstico", kind: "textarea" },
    { name: "dieta", label: "Dieta", kind: "textarea" },
    { name: "soluciones", label: "Soluciones", kind: "textarea" },
    { name: "medicamentos", label: "Medicamentos", kind: "textarea" },
    { name: "cuidadosGenerales", label: "Cuidados Generales de Enfermería", kind: "textarea" },
  ] },
];

const emptyForm: NotaOperatoriaForm = {
  fechaCirugia: "", lugarCirugia: "", notaPreoperatoria: "", notaPostoperatoria: "",
  diagnosticoPreoperatorio: "", diagnosticoPostoperatorio: "", cirugiaProgramada: "",
  cirugiaRealizada: "", hallazgos: "", tecnica: "", sangrado: "", drenajes: "",
  materialesTextiles: "", complicaciones: "", anestesiologo: "", tipoAnestesia: "",
  enfermeraInstrumentista: "", enfermeraCirculante: "", ayudantes: "", plan: "",
  pronostico: "", dieta: "", soluciones: "", medicamentos: "", cuidadosGenerales: "",
};

function Campo({ id, label, error, className = "", children }: { id: string; label: string; error?: string; className?: string; children: ReactNode }) {
  return <div className={`nota-field ${className}`.trim()}><label htmlFor={id}>{label}</label>{error && <p className="nota-field-error" role="alert">{error}</p>}{children}</div>;
}

function inputDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function fingerprint(file: File) {
  return [file.name.toLowerCase(), file.size, file.type.toLowerCase(), file.lastModified].join(":");
}

function esImagen(archivo: { nombreArchivo: string; formatoArchivo: string }) {
  return archivo.formatoArchivo.toLowerCase().startsWith("image/") ||
    /\.(png|jpe?g|webp|gif|avif|bmp|svg)$/i.test(archivo.nombreArchivo);
}

export default function EditarNota({ id }: EditarNotaProps) {
  const router = useRouter();
  const [form, setForm] = useState<NotaOperatoriaForm>(emptyForm);
  const [expedienteId, setExpedienteId] = useState("");
  const [archivos, setArchivos] = useState<ArchivoNota[]>([]);
  const [nuevosArchivos, setNuevosArchivos] = useState<ArchivoNuevo[]>([]);
  const [subidos, setSubidos] = useState<Record<string, string>>({});
  const [eliminando, setEliminando] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [errores, setErrores] = useState<Partial<Record<FieldName, string>>>({});
  const [cargado, setCargado] = useState(false);
  const carruselRef = useRef<HTMLDivElement>(null);
  const [puedeAnterior, setPuedeAnterior] = useState(false);
  const [puedeSiguiente, setPuedeSiguiente] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState<{ url: string; nombre: string } | null>(null);
  const urlsVistaPrevia = useRef(new Set<string>());

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
  }, [actualizarFlechas, archivos, nuevosArchivos]);

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

  useEffect(
    () => () => {
      urlsVistaPrevia.current.forEach((url) => URL.revokeObjectURL(url));
      urlsVistaPrevia.current.clear();
    },
    [],
  );

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/notas/${encodeURIComponent(id)}`, { cache: "no-store", signal: controller.signal });
        const result = await response.json().catch(() => null) as RespuestaNota | null;
        if (!response.ok || !result?.ok || !result.data?.nota) {
          throw new Error(result?.error || "No se pudo cargar la nota operatoria.");
        }
        const nota = result.data.nota;
        const formInicial = { ...emptyForm };
        for (const name of Object.keys(emptyForm) as FieldName[]) {
          const value = nota[name];
          formInicial[name] = name === "fechaCirugia"
            ? inputDate(value)
            : typeof value === "string" ? value : "";
        }
        setExpedienteId(nota.idExpediente);
        setForm(formInicial);
        setArchivos(result.data.archivos ?? []);
        setCargado(true);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "No se pudo cargar la nota operatoria.");
      } finally {
        if (!controller.signal.aborted) setCargando(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  const update = (name: FieldName, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrores((current) => ({ ...current, [name]: undefined }));
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const allowed: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", pdf: "application/pdf" };
    const known = new Set(nuevosArchivos.map(({ file }) => fingerprint(file)));
    const accepted: ArchivoNuevo[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(list)) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowed[extension] || file.type !== allowed[extension]) { rejected.push(file.name); continue; }
      const key = fingerprint(file);
      if (known.has(key)) continue;
      known.add(key);
      const id = crypto.randomUUID();
      const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined;
      if (previewUrl) urlsVistaPrevia.current.add(previewUrl);
      accepted.push({ id, file, previewUrl });
    }
    setNuevosArchivos((current) => [...current, ...accepted]);
    setError(rejected.length ? `No se aceptaron: ${rejected.join(", ")}. Solo se permiten PNG, JPEG, WEBP y PDF.` : "");
  };

  const removeFile = async (fileId: string) => {
    const pending = nuevosArchivos.find((item) => item.id === fileId);
    const existing = archivos.find((item) => item._id === fileId);
    const uploadedId = subidos[fileId];
    if (pending && uploadedId) {
      setEliminando((current) => new Set(current).add(fileId));
      try {
        const response = await fetch(`/api/archivos/${encodeURIComponent(uploadedId)}`, { method: "DELETE" });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.ok === false) throw new Error(result?.error || "No se pudo eliminar el archivo.");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo eliminar el archivo.");
        setEliminando((current) => { const next = new Set(current); next.delete(fileId); return next; });
        return;
      }
      setSubidos((current) => { const next = { ...current }; delete next[fileId]; return next; });
      setEliminando((current) => { const next = new Set(current); next.delete(fileId); return next; });
    } else if (existing) {
      setEliminando((current) => new Set(current).add(fileId));
      try {
        const response = await fetch(`/api/archivos/${encodeURIComponent(fileId)}`, { method: "DELETE" });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.ok === false) throw new Error(result?.error || "No se pudo eliminar el archivo.");
        setArchivos((current) => current.filter((archivo) => archivo._id !== fileId));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "No se pudo eliminar el archivo.");
      } finally {
        setEliminando((current) => { const next = new Set(current); next.delete(fileId); return next; });
      }
    }
    if (pending?.previewUrl) {
      URL.revokeObjectURL(pending.previewUrl);
      urlsVistaPrevia.current.delete(pending.previewUrl);
    }
    setNuevosArchivos((current) => current.filter((item) => item.id !== fileId));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setErrores({});
    if (!form.fechaCirugia || !form.lugarCirugia) {
      const nuevos: Partial<Record<FieldName, string>> = {};
      if (!form.fechaCirugia) nuevos.fechaCirugia = "Selecciona la fecha de la cirugía.";
      if (!form.lugarCirugia) nuevos.lugarCirugia = "Selecciona el lugar de la cirugía.";
      setErrores(nuevos);
      return;
    }
    setGuardando(true);
    try {
      const response = await fetch(`/api/notas/${encodeURIComponent(id)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok === false) {
        const resumen = resumenErroresCampos(result?.campos);
        if (resumen) {
          setErrores(result.campos);
          const primerCampo = Object.keys(result.campos)[0];
          if (primerCampo) {
            const elemento = document.getElementById(primerCampo);
            elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
            elemento?.focus({ preventScroll: true });
          }
          return;
        }
        throw new Error(result?.error || "No se pudieron guardar los cambios.");
      }

      for (const pending of nuevosArchivos) {
        if (subidos[pending.id]) continue;
        const body = new FormData();
        body.append("archivo", pending.file);
        body.append("idNota", id);
        const upload = await fetch("/api/archivos", { method: "POST", body });
        const uploaded = await upload.json().catch(() => null);
        if (!upload.ok || uploaded?.ok === false || typeof uploaded?.data?._id !== "string") {
          throw new Error(uploaded?.error || `No se pudo subir el archivo ${pending.file.name}.`);
        }
        setSubidos((current) => ({ ...current, [pending.id]: uploaded.data._id }));
      }
      router.push(`/admin/ver-expediente/${encodeURIComponent(expedienteId)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Ocurrió un error al guardar la nota.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="crear-nota-shell ver-nota-estado" aria-busy="true"><p>Cargando nota operatoria…</p></div>;
  }
  if (!cargado) {
    return <div className="crear-nota-shell ver-nota-estado"><p className="ver-nota-error" role="alert">{error || "No se pudo cargar la nota operatoria."}</p><div className="ver-nota-estado-acciones"><button type="button" onClick={() => router.back()}>Volver</button></div></div>;
  }

  const imagenes: ImagenCarrusel[] = [
    ...archivos.filter(esImagen).map((archivo) => ({
      id: archivo._id,
      nombre: archivo.nombreArchivo,
      url: /^https?:\/\//i.test(archivo.url) ? archivo.url : "",
      deleting: eliminando.has(archivo._id),
    })),
    ...nuevosArchivos
      .filter(({ file }) => file.type.startsWith("image/"))
      .map(({ id: fileId, file, previewUrl }) => ({
        id: fileId,
        nombre: file.name,
        url: previewUrl ?? "",
        deleting: eliminando.has(fileId),
      })),
  ];

  const dropzoneFiles: DropzoneFile[] = [
    ...archivos
      .filter((archivo) => !esImagen(archivo))
      .map((archivo) => ({ id: archivo._id, name: archivo.nombreArchivo, uploaded: true, deleting: eliminando.has(archivo._id) })),
    ...nuevosArchivos
      .filter(({ file }) => !file.type.startsWith("image/"))
      .map(({ id: fileId, file }) => ({ id: fileId, name: file.name, size: file.size, uploaded: Boolean(subidos[fileId]), deleting: eliminando.has(fileId) })),
  ];

  const desplazarCarrusel = (direccion: -1 | 1) => {
    const carrusel = carruselRef.current;
    if (!carrusel) return;
    const primerElemento = carrusel.querySelector<HTMLElement>(".ver-nota-carousel-item");
    const ancho = (primerElemento?.getBoundingClientRect().width ?? carrusel.clientWidth) + 16;
    carrusel.scrollBy({ left: direccion * ancho, behavior: "smooth" });
  };

  return (
    <div className="crear-nota-shell">
      <form className="crear-nota-form" onSubmit={onSubmit} noValidate>
        <header className="crear-nota-header"><h1>Editar Nota Operatoria</h1></header>
        {fields.map((section, sectionIndex) => (
          <section className="nota-section" key={section.title}>
            <div className="nota-section-heading"><span>{String(sectionIndex + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>
            <div className="nota-fields-grid">
              {section.items.map((field) => (
                <Campo key={field.name} id={field.name} label={field.label} error={errores[field.name]} className={field.wide ? "nota-field-wide" : ""}>
                  {field.kind === "textarea" ? (
                    <textarea id={field.name} rows={4} value={form[field.name]} onChange={(event) => update(field.name, event.target.value)} />
                  ) : field.kind === "place" || field.kind === "surgery" ? (
                    <select id={field.name} value={form[field.name]} onChange={(event) => update(field.name, event.target.value)}>
                      <option value="">Selecciona una opción</option>
                      {!(field.kind === "place" ? lugaresCirugia : cirugias).includes(form[field.name]) && form[field.name] && <option value={form[field.name]}>{form[field.name]}</option>}
                      {(field.kind === "place" ? lugaresCirugia : cirugias).map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  ) : (
                    <input id={field.name} type={field.kind === "date" ? "date" : "text"} value={form[field.name]} required={field.name === "fechaCirugia" || field.name === "lugarCirugia"} onChange={(event) => update(field.name, event.target.value)} />
                  )}
                </Campo>
              ))}
            </div>
          </section>
        ))}
        <section className="nota-section nota-files-section">
          <div className="nota-section-heading"><span>04</span><h2>Archivos Adjuntos</h2></div>
          {imagenes.length > 0 && (
            <div className="ver-nota-carousel">
              <div className="ver-nota-carousel-header">
                <span>Imágenes</span>
                <span className="ver-nota-carousel-count">
                  {imagenes.length} {imagenes.length === 1 ? "imagen" : "imágenes"}
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
                  {imagenes.map((imagen) => (
                    <figure className="ver-nota-carousel-item" key={imagen.id}>
                      {imagen.url ? (
                        <button
                          type="button"
                          className="ver-nota-carousel-image-button"
                          onClick={() => setImagenAmpliada({ url: imagen.url, nombre: imagen.nombre })}
                          aria-label={`Ampliar ${imagen.nombre}`}
                          aria-haspopup="dialog"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={imagen.url} alt={imagen.nombre} loading="lazy" decoding="async" />
                        </button>
                      ) : (
                        <div className="ver-nota-carousel-placeholder">
                          <HiDocumentText aria-hidden="true" />
                          <span>Sin vista previa</span>
                        </div>
                      )}
                      <figcaption className="ver-nota-carousel-caption">
                        <span title={imagen.nombre}>{imagen.nombre}</span>
                        {imagen.url && (
                          <button
                            type="button"
                            className="ver-nota-file-link ver-nota-file-link-button"
                            onClick={() => setImagenAmpliada({ url: imagen.url, nombre: imagen.nombre })}
                            aria-haspopup="dialog"
                          >
                            Ampliar
                          </button>
                        )}
                        <button
                          type="button"
                          className="nota-file-remove"
                          aria-label={`Eliminar ${imagen.nombre}`}
                          disabled={guardando || imagen.deleting}
                          onClick={() => void removeFile(imagen.id)}
                        >
                          <span>{imagen.deleting ? "Eliminando…" : "Eliminar"}</span>
                        </button>
                      </figcaption>
                    </figure>
                  ))}
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
          <FileDropzone files={dropzoneFiles} onFilesSelected={addFiles} onRemoveFile={(fileId) => void removeFile(fileId)} disabled={guardando || eliminando.size > 0} />
        </section>
        {error && <p className="nota-field-error" role="alert">{error}</p>}
        <footer className="nota-form-actions">
          <button className="nota-cancel-button" type="button" onClick={() => router.push(`/admin/ver-expediente/${encodeURIComponent(expedienteId)}`)}>Cancelar</button>
          <button className="nota-create-button" type="submit" disabled={guardando || eliminando.size > 0}>{guardando ? "Guardando…" : "Guardar Cambios"}</button>
        </footer>
      </form>
      {imagenAmpliada && (
        <div
          className="ver-nota-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setImagenAmpliada(null);
          }}
        >
          <div
            className="ver-nota-modal-contenido"
            role="dialog"
            aria-modal="true"
            aria-label={`Imagen ampliada: ${imagenAmpliada.nombre}`}
          >
            <div className="ver-nota-modal-header">
              <span className="ver-nota-modal-titulo">{imagenAmpliada.nombre}</span>
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
              <img src={imagenAmpliada.url} alt={imagenAmpliada.nombre} decoding="async" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
