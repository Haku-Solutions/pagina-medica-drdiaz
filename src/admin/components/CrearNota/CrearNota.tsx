"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { HiDocumentText } from "react-icons/hi2";
import { cirugias, lugaresCirugia } from "@/src/admin/components/CrearNota/mocks/notaOperatoria.mock";
import FileDropzone from "../fileDropzone/fileDropzone";
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
      {children}
      {error && (
        <p className="nota-field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CrearNota() {
  const [form, setForm] = useState<NotaOperatoriaForm>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [errores, setErrores] = useState<Errores>({});

  const updateField = (name: FormField, value: string) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrores((current) => ({ ...current, [name]: undefined }));
  };

  const addFiles = (selected: FileList | null) => {
    if (selected) {
      setFiles((current) => [...current, ...Array.from(selected)]);
    }
  };

  const validate = () => {
    const nuevos: Errores = {};

    if (!form.fechaCirugia) {
      nuevos.fechaCirugia = "Selecciona la fecha de la cirugía.";
    }

    if (!form.lugarCirugia) {
      nuevos.lugarCirugia = "Selecciona el lugar de la cirugía.";
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    validate();
  };

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

            <Campo id="notaPreoperatoria" label="Nota Preoperatoria">
              <input
                id="notaPreoperatoria"
                placeholder="Escribe la nota preoperatoria"
                value={form.notaPreoperatoria}
                onChange={(event) =>
                  updateField("notaPreoperatoria", event.target.value)
                }
              />
            </Campo>

            <Campo id="notaPostoperatoria" label="Nota Postoperatoria">
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
            >
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
            >
              <input
                id="diagnosticoPostoperatorio"
                placeholder="Escribe el diagnóstico postoperatorio"
                value={form.diagnosticoPostoperatorio}
                onChange={(event) =>
                  updateField("diagnosticoPostoperatorio", event.target.value)
                }
              />
            </Campo>

            <Campo id="cirugiaProgramada" label="Cirugía Programada">
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

            <Campo id="cirugiaRealizada" label="Cirugía Realizada">
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
            >
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

            <Campo id="tecnica" label="Técnica">
              <input
                id="tecnica"
                placeholder="Describe la técnica utilizada"
                value={form.tecnica}
                onChange={(event) => updateField("tecnica", event.target.value)}
              />
            </Campo>

            <Campo id="sangrado" label="Sangrado">
              <input
                id="sangrado"
                placeholder="Indica el sangrado"
                value={form.sangrado}
                onChange={(event) => updateField("sangrado", event.target.value)}
              />
            </Campo>

            <Campo id="drenajes" label="Drenajes">
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
            >
              <input
                id="materialesTextiles"
                placeholder="Indica la cuenta de materiales y textiles"
                value={form.materialesTextiles}
                onChange={(event) =>
                  updateField("materialesTextiles", event.target.value)
                }
              />
            </Campo>

            <Campo id="complicaciones" label="Complicaciones">
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
            <Campo id="anestesiologo" label="Anestesiólogo">
              <input
                id="anestesiologo"
                placeholder="Nombre del anestesiólogo"
                value={form.anestesiologo}
                onChange={(event) =>
                  updateField("anestesiologo", event.target.value)
                }
              />
            </Campo>

            <Campo id="tipoAnestesia" label="Tipo de Anestesia">
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
            >
              <input
                id="enfermeraInstrumentista"
                placeholder="Nombre de la enfermera instrumentista"
                value={form.enfermeraInstrumentista}
                onChange={(event) =>
                  updateField("enfermeraInstrumentista", event.target.value)
                }
              />
            </Campo>

            <Campo id="enfermeraCirculante" label="Enfermera Circulante">
              <input
                id="enfermeraCirculante"
                placeholder="Nombre de la enfermera circulante"
                value={form.enfermeraCirculante}
                onChange={(event) =>
                  updateField("enfermeraCirculante", event.target.value)
                }
              />
            </Campo>

            <Campo id="ayudantes" label="Ayudantes">
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
            <Campo id="plan" label="Plan">
              <textarea
                id="plan"
                placeholder="Escribe el plan postoperatorio"
                rows={4}
                value={form.plan}
                onChange={(event) => updateField("plan", event.target.value)}
              />
            </Campo>

            <Campo id="pronostico" label="Pronóstico">
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

            <Campo id="dieta" label="Dieta">
              <textarea
                id="dieta"
                placeholder="Indica la dieta"
                rows={4}
                value={form.dieta}
                onChange={(event) => updateField("dieta", event.target.value)}
              />
            </Campo>

            <Campo id="soluciones" label="Soluciones">
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

            <Campo id="medicamentos" label="Medicamentos">
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
            >
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

          <FileDropzone onFilesSelected={addFiles} />
          {files.length > 0 && (
            <ul className="nota-file-list">
              {files.map((file, index) => (
                <li key={`${file.name}-${index}`}>
                  <HiDocumentText aria-hidden="true" />
                  <span>{file.name}</span>
                  <small>{(file.size / 1024).toFixed(0)} KB</small>
                </li>
              ))}
            </ul>
          )}
        </section>

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
          >
            Crear Nota Operatoria
          </button>
        </footer>
      </form>
    </div>
  );
}
