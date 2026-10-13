"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { HiArrowLeft, HiDocumentText } from "react-icons/hi2";
import { cirugias, lugaresCirugia } from "@/src/admin/crearNota/mocks/notaOperatoria.mock";
import TextField from "../components/textField/textField";
import SelectField from "../components/selectField/selectField";
import DateField from "../components/dateField/dateField";
import FileDropzone from "../components/fileDropzone/fileDropzone";
import "./crearNota.css";

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

const surgeryFields: { label: string; name: FormField; type?: "select"; options?: string[]; required?: boolean }[] = [
  { label: "Lugar de la Cirugía", name: "lugarCirugia", type: "select", options: lugaresCirugia, required: true},
  { label: "Nota Preoperatoria", name: "notaPreoperatoria"},
  { label: "Nota Postoperatoria", name: "notaPostoperatoria"},
  { label: "Diagnóstico Preoperatorio", name: "diagnosticoPreoperatorio"},
  { label: "Diagnóstico Postoperatorio", name: "diagnosticoPostoperatorio"},
  { label: "Cirugía Programada", name: "cirugiaProgramada", type: "select", options: cirugias},
  { label: "Cirugía Realizada", name: "cirugiaRealizada", type: "select", options: cirugias},
  { label: "Técnica", name: "tecnica"}, 
  { label: "Sangrado", name: "sangrado"},
  { label: "Drenajes", name: "drenajes"}, 
  { label: "Cuenta de Materiales y Textiles", name: "materialesTextiles"},
  { label: "Complicaciones", name: "complicaciones"},
];
const teamFields: { label: string; name: FormField; required?: boolean }[] = [
  { label: "Anestesiólogo", name: "anestesiologo"}, 
  { label: "Tipo de Anestesia", name: "tipoAnestesia"},
  { label: "Enfermera Instrumentista", name: "enfermeraInstrumentista"},
  { label: "Enfermera Circulante", name: "enfermeraCirculante"}, 
  { label: "Ayudantes", name: "ayudantes"},
];
const postoperativeFields: { label: string; name: FormField; required?: boolean }[] = [
  { label: "Plan", name: "plan"}, 
  { label: "Pronóstico", name: "pronostico"},
  { label: "Dieta", name: "dieta"}, 
  { label: "Soluciones", name: "soluciones"},
  { label: "Medicamentos", name: "medicamentos"},
  { label: "Cuidados Generales de Enfermería", name: "cuidadosGenerales"},
];

export default function CrearNota() {
  const [form, setForm] = useState<NotaOperatoriaForm>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const updateField = (name: FormField, value: string) => setForm((current) => ({ ...current, [name]: value }));
  const addFiles = (selected: FileList | null) => { if (selected) setFiles((current) => [...current, ...Array.from(selected)]); };
  const submitMock = (event: FormEvent<HTMLFormElement>) => event.preventDefault();

  return (
    <div className="crear-nota-shell">
      <header className="crear-nota-header">
        <Image className="crear-nota-logo" src="/assets/logos/logo_drdiaz.svg" alt="Logo del Dr. Díaz" width={68} height={68} />
        <div>
          <h1>NUEVA NOTA OPERATORIA</h1>
        </div>
      </header>

      <form className="crear-nota-form" onSubmit={submitMock}>
        <section className="nota-section">
          <div className="nota-section-heading">
            <span>01</span>
            <h2>Datos de la Cirugía</h2>
            </div>
            <div className="nota-fields-grid">
              <DateField label="Fecha de la Cirugía" value={form.fechaCirugia} required onChange={(value) => updateField("fechaCirugia", value)} />
              {surgeryFields.slice(0, 1).map((field) => <SelectField key={field.name} label={field.label} name={field.name} value={form[field.name]} options={field.options ?? []} required={field.required} onChange={(value) => updateField(field.name, value)} />)}{surgeryFields.slice(1, 5).map((field) => <TextField key={field.name} label={field.label} name={field.name} value={form[field.name]} onChange={(value) => updateField(field.name, value)} />)}
              {surgeryFields.slice(5, 7).map((field) => <SelectField key={field.name} label={field.label} name={field.name} value={form[field.name]} options={field.options ?? []} required={field.required} onChange={(value) => updateField(field.name, value)} />)}
              <label className="nota-field nota-field-wide"><span>Hallazgos</span><textarea rows={4} value={form.hallazgos} onChange={(event) => updateField("hallazgos", event.target.value)} /></label>
              {surgeryFields.slice(7).map((field) => <TextField key={field.name} label={field.label} name={field.name} value={form[field.name]} onChange={(value) => updateField(field.name, value)} />)}
            </div>
        </section>

        <section className="nota-section">
          <div className="nota-section-heading">
            <span>02</span>
            <h2>Equipo de la Cirugía</h2>
          </div>
          <div className="nota-fields-grid">
            {teamFields.map((field) => <TextField key={field.name} label={field.label} name={field.name} value={form[field.name]} onChange={(value) => updateField(field.name, value)} />)}
            </div>
        </section>

        <section className="nota-section">
          <div className="nota-section-heading">
            <span>03</span>
            <h2>Indicaciones Postoperatorias</h2>
          </div>
          <div className="nota-fields-grid nota-textarea-grid">
            {postoperativeFields.map((field) => <label className="nota-field" key={field.name}><span>{field.label}</span><textarea rows={4} value={form[field.name]} onChange={(event) => updateField(field.name, event.target.value)} /></label>)}
          </div>
        </section>

        <section className="nota-section nota-files-section">
          <div className="nota-section-heading">
            <span>04</span>
            <h2>Cargar Archivos</h2>
          </div>
          <FileDropzone onFilesSelected={addFiles} />
          {files.length > 0 && <ul className="nota-file-list">{files.map((file, index) => <li key={`${file.name}-${index}`}><HiDocumentText aria-hidden="true" /><span>{file.name}</span><small>{(file.size / 1024).toFixed(0)} KB</small></li>)}</ul>}
        </section>

        <footer className="nota-form-actions">
          <button className="nota-back-button" type="button" onClick={() => window.history.back()}><HiArrowLeft aria-hidden="true" />Atrás</button>
          <button className="nota-create-button" type="submit" onClick={() => window.location.href = "/"} >Crear Nota Operatoria</button>
        </footer>
        
      </form>
  </div> 
  );
    
}
