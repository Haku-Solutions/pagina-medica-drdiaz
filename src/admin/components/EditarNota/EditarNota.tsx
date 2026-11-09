"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import FileDropzone, { type DropzoneFile } from "../fileDropzone/fileDropzone";
import type { NotaOperatoriaForm } from "../CrearNota/CrearNota";
import { cirugias, lugaresCirugia } from "../CrearNota/mocks/notaOperatoria.mock";
import "../CrearNota/CrearNota.css";

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

function Campo({ id, label, className = "", children }: { id: string; label: string; className?: string; children: ReactNode }) {
  return <div className={`nota-field ${className}`.trim()}><label htmlFor={id}>{label}</label>{children}</div>;
}

function inputDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function fingerprint(file: File) {
  return [file.name.toLowerCase(), file.size, file.type.toLowerCase(), file.lastModified].join(":");
}

export default function EditarNota({ id }: EditarNotaProps) {
  const router = useRouter();
  const [form, setForm] = useState<NotaOperatoriaForm>(emptyForm);
  const [expedienteId, setExpedienteId] = useState("");
  const [archivos, setArchivos] = useState<ArchivoNota[]>([]);
  const [nuevosArchivos, setNuevosArchivos] = useState<{ id: string; file: File }[]>([]);
  const [subidos, setSubidos] = useState<Record<string, string>>({});
  const [eliminando, setEliminando] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [cargado, setCargado] = useState(false);

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

  const update = (name: FieldName, value: string) => setForm((current) => ({ ...current, [name]: value }));

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const allowed: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", pdf: "application/pdf" };
    const known = new Set(nuevosArchivos.map(({ file }) => fingerprint(file)));
    const accepted: { id: string; file: File }[] = [];
    const rejected: string[] = [];
    for (const file of Array.from(list)) {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      if (!allowed[extension] || file.type !== allowed[extension]) { rejected.push(file.name); continue; }
      const key = fingerprint(file);
      if (known.has(key)) continue;
      known.add(key);
      accepted.push({ id: crypto.randomUUID(), file });
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
    setNuevosArchivos((current) => current.filter((item) => item.id !== fileId));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!form.fechaCirugia || !form.lugarCirugia) {
      setError("La fecha y el lugar de la cirugía son obligatorios.");
      return;
    }
    setGuardando(true);
    try {
      const response = await fetch(`/api/notas/${encodeURIComponent(id)}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.ok === false) throw new Error(result?.error || "No se pudieron guardar los cambios.");

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

  const dropzoneFiles: DropzoneFile[] = [
    ...archivos.map((archivo) => ({ id: archivo._id, name: archivo.nombreArchivo, uploaded: true, deleting: eliminando.has(archivo._id) })),
    ...nuevosArchivos.map(({ id: fileId, file }) => ({ id: fileId, name: file.name, size: file.size, uploaded: Boolean(subidos[fileId]), deleting: eliminando.has(fileId) })),
  ];

  return (
    <div className="crear-nota-shell">
      <form className="crear-nota-form" onSubmit={onSubmit} noValidate>
        <header className="crear-nota-header"><h1>Editar Nota Operatoria</h1></header>
        {fields.map((section, sectionIndex) => (
          <section className="nota-section" key={section.title}>
            <div className="nota-section-heading"><span>{String(sectionIndex + 1).padStart(2, "0")}</span><h2>{section.title}</h2></div>
            <div className="nota-fields-grid">
              {section.items.map((field) => (
                <Campo key={field.name} id={field.name} label={field.label} className={field.wide ? "nota-field-wide" : ""}>
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
          <FileDropzone files={dropzoneFiles} onFilesSelected={addFiles} onRemoveFile={(fileId) => void removeFile(fileId)} disabled={guardando || eliminando.size > 0} />
        </section>
        {error && <p className="nota-field-error" role="alert">{error}</p>}
        <footer className="nota-form-actions">
          <button className="nota-cancel-button" type="button" onClick={() => router.push(`/admin/ver-expediente/${encodeURIComponent(expedienteId)}`)}>Cancelar</button>
          <button className="nota-create-button" type="submit" disabled={guardando || eliminando.size > 0}>{guardando ? "Guardando…" : "Guardar Cambios"}</button>
        </footer>
      </form>
    </div>
  );
}
