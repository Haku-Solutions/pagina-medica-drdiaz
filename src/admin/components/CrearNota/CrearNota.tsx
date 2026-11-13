"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { resumenErroresCampos } from "@/src/admin/utils/formValidation";
import { cirugias, lugaresCirugia } from "@/src/admin/components/CrearNota/mocks/notaOperatoria.mock";
import FileDropzone, { type DropzoneFile } from "../fileDropzone/fileDropzone";
import "./CrearNota.css";

export interface NotaOperatoriaForm {
  fechaCirugia: string;
  lugarCirugia: string;
  notaPreoperatoria: string;
  notaPostoperatoria: string;
  diagnosticoPreoperatorio: string;
  diagnosticoPostoperatorio: string;
  cirugiaProgramada: string;
  cirugiaRealizada: string;
  hallazgos: string;
  tecnica: string;
  sangrado: string;
  drenajes: string;
  materialesTextiles: string;
  complicaciones: string;
  anestesiologo: string;
  tipoAnestesia: string;
  enfermeraInstrumentista: string;
  enfermeraCirculante: string;
  ayudantes: string;
  plan: string;
  pronostico: string;
  dieta: string;
  soluciones: string;
  medicamentos: string;
  cuidadosGenerales: string;
}

const initialForm: NotaOperatoriaForm = {
  fechaCirugia: "",
  lugarCirugia: "",
  notaPreoperatoria: "",
  notaPostoperatoria: "",
  diagnosticoPreoperatorio: "",
  diagnosticoPostoperatorio: "",
  cirugiaProgramada: "",
  cirugiaRealizada: "",
  hallazgos: "",
  tecnica: "",
  sangrado: "",
  drenajes: "",
  materialesTextiles: "",
  complicaciones: "",
  anestesiologo: "",
  tipoAnestesia: "",
  enfermeraInstrumentista: "",
  enfermeraCirculante: "",
  ayudantes: "",
  plan: "",
  pronostico: "",
  dieta: "",
  soluciones: "",
  medicamentos: "",
  cuidadosGenerales: "",
};

type FormField = keyof NotaOperatoriaForm;
type Errores = Partial<Record<FormField, string>>;

interface CrearNotaProps {
  expedienteId: string;
}

interface ArchivoPendiente {
  id: string;
  file: File;
}

const huellaArchivo = (file: File) =>
  [file.name.toLowerCase(), file.size, file.type.toLowerCase(), file.lastModified].join(":");

type CampoProps = {
  id: string;
  label: string;
  requerido?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
};

function Campo({
  id,
  label,
  requerido,
  error,
  className = "",
  children,
}: CampoProps) {
  return (
    <div className={`nota-field ${className}`.trim()}>
      <label htmlFor={id}>
        {label}
        {requerido && <span className="nota-required">*</span>}
      </label>
      {error && (
        <p className="nota-field-error" role="alert">
          {error}
        </p>
      )}
      {children}
    </div>
  );
}

export default function CrearNota({ expedienteId }: CrearNotaProps) {
  const router = useRouter();
  const [form, setForm] = useState<NotaOperatoriaForm>(initialForm);
  const [files, setFiles] = useState<ArchivoPendiente[]>([]);
  const [errores, setErrores] = useState<Errores>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [createdNoteId, setCreatedNoteId] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(() => new Set());
  const [fileSelectionError, setFileSelectionError] = useState("");
  const [accesoValidado, setAccesoValidado] = useState(false);
  const accesoComprobado = useRef(false);
  const huellasArchivos = useRef(new Set<string>());

  useEffect(() => {
    if (accesoComprobado.current) return;
    accesoComprobado.current = true;

    try {
      const permiso = sessionStorage.getItem("crear-nota-expediente");
      const datos = permiso ? (JSON.parse(permiso) as { id?: string; expiresAt?: number }) : null;
      if (
        datos?.id === expedienteId &&
        typeof datos.expiresAt === "number" &&
        datos.expiresAt >= Date.now()
      ) {
        sessionStorage.removeItem("crear-nota-expediente");
        sessionStorage.setItem("nota-expediente-activo", expedienteId);
        setAccesoValidado(true);
        return;
      }

      const navegacion = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming | undefined;
      const esRecargaORegreso =
        navegacion?.type === "reload" || navegacion?.type === "back_forward";
      if (
        esRecargaORegreso &&
        sessionStorage.getItem("nota-expediente-activo") === expedienteId
      ) {
        setAccesoValidado(true);
        return;
      }
    } catch {
      // Un permiso inválido se trata como acceso directo a la ruta.
    }

    router.replace("/admin/mispacientes");
  }, [expedienteId, router]);

  const updateField = (name: FormField, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrores((current) => ({ ...current, [name]: undefined }));
  };

  const addFiles = (selected: FileList | null) => {
    if (selected) {
      const mimeByExtension: Record<string, string> = {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        pdf: "application/pdf",
      };
      const accepted: ArchivoPendiente[] = [];
      const rejected: string[] = [];
      const duplicates: string[] = [];

      for (const file of Array.from(selected)) {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        const expectedMime = mimeByExtension[extension];
        if (expectedMime && (!file.type || file.type === expectedMime)) {
          const fingerprint = huellaArchivo(file);
          if (huellasArchivos.current.has(fingerprint)) {
            duplicates.push(file.name);
            continue;
          }
          huellasArchivos.current.add(fingerprint);
          accepted.push({ id: crypto.randomUUID(), file });
        } else {
          rejected.push(file.name);
        }
      }

      if (accepted.length) setFiles((current) => [...current, ...accepted]);
      const messages = [];
      if (rejected.length) {
        messages.push(
          `No se aceptaron: ${rejected.join(", ")}. Solo se permiten PNG, JPEG, WEBP y PDF.`,
        );
      }
      if (duplicates.length) {
        messages.push(`Ya estaban agregados y se omitieron: ${duplicates.join(", ")}.`);
      }
      setFileSelectionError(messages.join(" "));
    }
  };

  const removeFile = async (fileId: string) => {
    const pendingFile = files.find((pending) => pending.id === fileId);
    const uploadedId = uploadedFiles[fileId];
    if (uploadedId) {
      setDeletingFiles((current) => new Set(current).add(fileId));
      try {
        const response = await fetch(`/api/archivos/${encodeURIComponent(uploadedId)}`, {
          method: "DELETE",
        });
        const result = await response.json().catch(() => null);
        if (!response.ok || result?.ok === false) {
          throw new Error(result?.error || "No se pudo eliminar el archivo.");
        }
        setUploadedFiles((current) => {
          const next = { ...current };
          delete next[fileId];
          return next;
        });
      } catch (error) {
        setFileSelectionError(
          error instanceof Error ? error.message : "No se pudo eliminar el archivo."
        );
        setDeletingFiles((current) => {
          const next = new Set(current);
          next.delete(fileId);
          return next;
        });
        return;
      }
      setDeletingFiles((current) => {
        const next = new Set(current);
        next.delete(fileId);
        return next;
      });
    }

    if (pendingFile) huellasArchivos.current.delete(huellaArchivo(pendingFile.file));
    setFiles((current) => current.filter((pending) => pending.id !== fileId));
  };

  const dropzoneFiles: DropzoneFile[] = files.map(({ id, file }) => ({
    id,
    name: file.name,
    size: file.size,
    uploaded: Boolean(uploadedFiles[id]),
    deleting: deletingFiles.has(id),
  }));

  const validate = () => {
    const nuevos: Errores = {};

    if (!form.fechaCirugia) {
      nuevos.fechaCirugia = "Selecciona la fecha de la cirugía.";
    }

    if (!form.lugarCirugia) {
      nuevos.lugarCirugia = "Selecciona el lugar de la cirugía.";
    }

    setErrores(nuevos);
    const primerCampoInvalido = Object.keys(nuevos)[0];
    if (primerCampoInvalido) {
      const elemento = document.getElementById(primerCampoInvalido);
      elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
      elemento?.focus({ preventScroll: true });
    }
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    if (deletingFiles.size > 0) return;
    if (!validate()) return;

    setIsSubmitting(true);
    let noteWasCreated = Boolean(createdNoteId);
    try {
      let noteId = createdNoteId;
      if (!noteId) {
        const response = await fetch("/api/notas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, idExpediente: expedienteId }),
        });
        const result = await response.json().catch(() => null);

        if (!response.ok || result?.ok === false) {
          if (result?.campos) {
            setErrores(result.campos);
            setSubmitError(resumenErroresCampos(result.campos) ? "" : result?.error ?? "Revisa los datos de la nota.");
            const primerCampo = Object.keys(result.campos)[0];
            if (primerCampo) {
              const elemento = document.getElementById(primerCampo);
              elemento?.scrollIntoView({ behavior: "smooth", block: "center" });
              elemento?.focus({ preventScroll: true });
            }
            return;
          }
          throw new Error(result?.error || "No se pudo guardar la nota operatoria.");
        }
        noteId = result?.data?._id;
        if (typeof noteId !== "string") {
          throw new Error("La nota se guardó, pero el servidor no devolvió su identificador.");
        }
        setCreatedNoteId(noteId);
        noteWasCreated = true;
      }

      for (const pending of files) {
        if (uploadedFiles[pending.id]) continue;
        const uploadData = new FormData();
        uploadData.append("archivo", pending.file);
        uploadData.append("idNota", noteId);
        const uploadResponse = await fetch("/api/archivos", {
          method: "POST",
          body: uploadData,
        });
        const uploadResult = await uploadResponse.json().catch(() => null);
        if (!uploadResponse.ok || uploadResult?.ok === false) {
          throw new Error(
            uploadResult?.error || `No se pudo subir el archivo ${pending.file.name}.`
          );
        }
        const uploadedId = uploadResult?.data?._id;
        if (typeof uploadedId !== "string") {
          throw new Error(`No se recibió el identificador del archivo ${pending.file.name}.`);
        }
        setUploadedFiles((current) => ({ ...current, [pending.id]: uploadedId }));
      }

      sessionStorage.removeItem("nota-expediente-activo");
      router.push(`/admin/ver-expediente/${encodeURIComponent(expedienteId)}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? noteWasCreated
            ? `La nota ya se guardó, pero falló la subida de un archivo. ${error.message} Puedes volver a pulsar para reintentar sin duplicar la nota.`
            : error.message
          : "Ocurrió un error al guardar la nota operatoria."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!accesoValidado) {
    return (
      <div className="crear-nota-shell" aria-busy="true">
        <p>Verificando acceso…</p>
      </div>
    );
  }

  return (
    <div className="crear-nota-shell">
      <form className="crear-nota-form" onSubmit={handleSubmit} noValidate>
        <header className="crear-nota-header">
          <h1>Nueva Nota Operatoria</h1>
        </header>

        <section className="nota-section">
          <div className="nota-section-heading">
            <span>01</span>
            <h2>Datos de la Cirugía</h2>
          </div>

          <div className="nota-fields-grid">
            <Campo id="fechaCirugia" label="Fecha de la Cirugía" requerido error={errores.fechaCirugia}>
              <input
                id="fechaCirugia"
                type="date"
                className="nota-date-input"
                value={form.fechaCirugia}
                aria-invalid={Boolean(errores.fechaCirugia)}
                onChange={(event) =>
                  updateField("fechaCirugia", event.target.value)
                }
                required
              />
            </Campo>

            <Campo id="lugarCirugia" label="Lugar de la Cirugía" requerido error={errores.lugarCirugia}>
              <select
                id="lugarCirugia"
                value={form.lugarCirugia}
                aria-invalid={Boolean(errores.lugarCirugia)}
                onChange={(event) =>
                  updateField("lugarCirugia", event.target.value)
                }
                required
              >
                <option value="">Selecciona una opción</option>
                {lugaresCirugia.map((lugar) => (
                  <option key={lugar} value={lugar}>
                    {lugar}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo id="notaPreoperatoria" label="Nota Preoperatoria" error={errores.notaPreoperatoria}>
              <input
                id="notaPreoperatoria"
                placeholder="Escribe la nota preoperatoria"
                value={form.notaPreoperatoria}
                onChange={(event) =>
                  updateField("notaPreoperatoria", event.target.value)
                }
              />
            </Campo>

            <Campo id="notaPostoperatoria" label="Nota Postoperatoria" error={errores.notaPostoperatoria}>
              <input
                id="notaPostoperatoria"
                placeholder="Escribe la nota postoperatoria"
                value={form.notaPostoperatoria}
                onChange={(event) =>
                  updateField("notaPostoperatoria", event.target.value)
                }
              />
            </Campo>

            <Campo
              id="diagnosticoPreoperatorio"
              label="Diagnóstico Preoperatorio"
             error={errores.diagnosticoPreoperatorio}>
              <input
                id="diagnosticoPreoperatorio"
                placeholder="Escribe el diagnóstico preoperatorio"
                value={form.diagnosticoPreoperatorio}
                onChange={(event) =>
                  updateField("diagnosticoPreoperatorio", event.target.value)
                }
              />
            </Campo>

            <Campo
              id="diagnosticoPostoperatorio"
              label="Diagnóstico Postoperatorio"
             error={errores.diagnosticoPostoperatorio}>
              <input
                id="diagnosticoPostoperatorio"
                placeholder="Escribe el diagnóstico postoperatorio"
                value={form.diagnosticoPostoperatorio}
                onChange={(event) =>
                  updateField("diagnosticoPostoperatorio", event.target.value)
                }
              />
            </Campo>

            <Campo id="cirugiaProgramada" label="Cirugía Programada" error={errores.cirugiaProgramada}>
              <select
                id="cirugiaProgramada"
                value={form.cirugiaProgramada}
                onChange={(event) =>
                  updateField("cirugiaProgramada", event.target.value)
                }
              >
                <option value="">Selecciona una opción</option>
                {cirugias.map((cirugia) => (
                  <option key={cirugia} value={cirugia}>
                    {cirugia}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo id="cirugiaRealizada" label="Cirugía Realizada" error={errores.cirugiaRealizada}>
              <select
                id="cirugiaRealizada"
                value={form.cirugiaRealizada}
                onChange={(event) =>
                  updateField("cirugiaRealizada", event.target.value)
                }
              >
                <option value="">Selecciona una opción</option>
                {cirugias.map((cirugia) => (
                  <option key={cirugia} value={cirugia}>
                    {cirugia}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo
              id="hallazgos"
              label="Hallazgos"
              className="nota-field-wide"
             error={errores.hallazgos}>
              <textarea
                id="hallazgos"
                placeholder="Describe los hallazgos"
                rows={4}
                value={form.hallazgos}
                onChange={(event) =>
                  updateField("hallazgos", event.target.value)
                }
              />
            </Campo>

            <Campo id="tecnica" label="Técnica" error={errores.tecnica}>
              <input
                id="tecnica"
                placeholder="Describe la técnica utilizada"
                value={form.tecnica}
                onChange={(event) => updateField("tecnica", event.target.value)}
              />
            </Campo>

            <Campo id="sangrado" label="Sangrado" error={errores.sangrado}>
              <input
                id="sangrado"
                placeholder="Indica el sangrado"
                value={form.sangrado}
                onChange={(event) => updateField("sangrado", event.target.value)}
              />
            </Campo>

            <Campo id="drenajes" label="Drenajes" error={errores.drenajes}>
              <input
                id="drenajes"
                placeholder="Indica los drenajes"
                value={form.drenajes}
                onChange={(event) => updateField("drenajes", event.target.value)}
              />
            </Campo>

            <Campo
              id="materialesTextiles"
              label="Cuenta de Materiales y Textiles"
             error={errores.materialesTextiles}>
              <input
                id="materialesTextiles"
                placeholder="Indica la cuenta de materiales y textiles"
                value={form.materialesTextiles}
                onChange={(event) =>
                  updateField("materialesTextiles", event.target.value)
                }
              />
            </Campo>

            <Campo id="complicaciones" label="Complicaciones" error={errores.complicaciones}>
              <input
                id="complicaciones"
                placeholder="Describe las complicaciones"
                value={form.complicaciones}
                onChange={(event) =>
                  updateField("complicaciones", event.target.value)
                }
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
            <Campo id="anestesiologo" label="Anestesiólogo" error={errores.anestesiologo}>
              <input
                id="anestesiologo"
                placeholder="Nombre del anestesiólogo"
                value={form.anestesiologo}
                onChange={(event) =>
                  updateField("anestesiologo", event.target.value)
                }
              />
            </Campo>

            <Campo id="tipoAnestesia" label="Tipo de Anestesia" error={errores.tipoAnestesia}>
              <input
                id="tipoAnestesia"
                placeholder="Indica el tipo de anestesia"
                value={form.tipoAnestesia}
                onChange={(event) =>
                  updateField("tipoAnestesia", event.target.value)
                }
              />
            </Campo>

            <Campo
              id="enfermeraInstrumentista"
              label="Enfermera Instrumentista"
             error={errores.enfermeraInstrumentista}>
              <input
                id="enfermeraInstrumentista"
                placeholder="Nombre de la enfermera instrumentista"
                value={form.enfermeraInstrumentista}
                onChange={(event) =>
                  updateField("enfermeraInstrumentista", event.target.value)
                }
              />
            </Campo>

            <Campo id="enfermeraCirculante" label="Enfermera Circulante" error={errores.enfermeraCirculante}>
              <input
                id="enfermeraCirculante"
                placeholder="Nombre de la enfermera circulante"
                value={form.enfermeraCirculante}
                onChange={(event) =>
                  updateField("enfermeraCirculante", event.target.value)
                }
              />
            </Campo>

            <Campo id="ayudantes" label="Ayudantes" error={errores.ayudantes}>
              <input
                id="ayudantes"
                placeholder="Nombres de los ayudantes"
                value={form.ayudantes}
                onChange={(event) => updateField("ayudantes", event.target.value)}
              />
            </Campo>
          </div>
        </section>

        <section className="nota-section">
          <div className="nota-section-heading">
            <span>03</span>
            <h2>Indicaciones Postoperatorias</h2>
          </div>

          <div className="nota-fields-grid nota-textarea-grid">
            <Campo id="plan" label="Plan" error={errores.plan}>
              <textarea
                id="plan"
                placeholder="Escribe el plan postoperatorio"
                rows={4}
                value={form.plan}
                onChange={(event) => updateField("plan", event.target.value)}
              />
            </Campo>

            <Campo id="pronostico" label="Pronóstico" error={errores.pronostico}>
              <textarea
                id="pronostico"
                placeholder="Escribe el pronóstico"
                rows={4}
                value={form.pronostico}
                onChange={(event) =>
                  updateField("pronostico", event.target.value)
                }
              />
            </Campo>

            <Campo id="dieta" label="Dieta" error={errores.dieta}>
              <textarea
                id="dieta"
                placeholder="Indica la dieta"
                rows={4}
                value={form.dieta}
                onChange={(event) => updateField("dieta", event.target.value)}
              />
            </Campo>

            <Campo id="soluciones" label="Soluciones" error={errores.soluciones}>
              <textarea
                id="soluciones"
                placeholder="Indica las soluciones"
                rows={4}
                value={form.soluciones}
                onChange={(event) =>
                  updateField("soluciones", event.target.value)
                }
              />
            </Campo>

            <Campo id="medicamentos" label="Medicamentos" error={errores.medicamentos}>
              <textarea
                id="medicamentos"
                placeholder="Indica los medicamentos"
                rows={4}
                value={form.medicamentos}
                onChange={(event) =>
                  updateField("medicamentos", event.target.value)
                }
              />
            </Campo>

            <Campo
              id="cuidadosGenerales"
              label="Cuidados Generales de Enfermería"
             error={errores.cuidadosGenerales}>
              <textarea
                id="cuidadosGenerales"
                placeholder="Describe los cuidados generales de enfermería"
                rows={4}
                value={form.cuidadosGenerales}
                onChange={(event) =>
                  updateField("cuidadosGenerales", event.target.value)
                }
              />
            </Campo>
          </div>
        </section>

        <section className="nota-section nota-files-section">
          <div className="nota-section-heading">
            <span>04</span>
            <h2>Cargar Archivos</h2>
          </div>

          <FileDropzone
            files={dropzoneFiles}
            onFilesSelected={addFiles}
            onRemoveFile={removeFile}
            disabled={isSubmitting}
          />
          {fileSelectionError && (
            <p className="nota-field-error" role="alert">{fileSelectionError}</p>
          )}
        </section>

        {submitError && (
          <p className="nota-field-error" role="alert">{submitError}</p>
        )}

        <footer className="nota-form-actions">
          <button
            className="nota-back-button"
            type="button"
            onClick={() => window.history.back()}
          >
            Atrás
          </button>
          <button
            className="nota-create-button"
            type="submit"
            disabled={isSubmitting || deletingFiles.size > 0}
          >
            {isSubmitting
              ? "Guardando..."
              : createdNoteId
                ? "Reintentar y volver a Mis pacientes"
                : "Crear Nota Operatoria"}
          </button>
        </footer>
      </form>
    </div>
  );
}
