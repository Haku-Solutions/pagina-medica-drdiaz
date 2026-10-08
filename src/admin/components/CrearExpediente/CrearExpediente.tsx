"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./CrearExpediente.css";

type Sexo = "hombre" | "mujer" | "";

const FORM_INICIAL = {
  nombre: "",
  fechaNacimiento: "",
  sexo: "" as Sexo,
  ciudadNacimiento: "",
  estadoNacimiento: "",
  curp: "",
  residencia: "",
  antecedentes: "",
  telefono: "",
  familiarNombre: "",
  familiarTelefono: "",
};

type Formulario = typeof FORM_INICIAL;
type Errores = Partial<Record<keyof Formulario, string>>;

const calcularEdad = (fecha: string) => {
  if (!fecha) return "";

  const nacimiento = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return "";

  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();

  const aunNoCumple =
    hoy.getMonth() < nacimiento.getMonth() ||
    (hoy.getMonth() === nacimiento.getMonth() &&
      hoy.getDate() < nacimiento.getDate());

  if (aunNoCumple) edad -= 1;

  return edad >= 0 ? String(edad) : "";
};

const soloDigitos = (valor: string) => valor.replace(/\D/g, "").slice(0, 10);

type CampoProps = {
  id: string;
  label: string;
  requerido?: boolean;
  error?: string;
  children: ReactNode;
};

function Campo({ id, label, requerido, error, children }: CampoProps) {
  return (
    <div className="crear-expediente-field">
      <label htmlFor={id} className="crear-expediente-label">
        {label}
        {requerido && <span className="crear-expediente-required">*</span>}
      </label>

      {children}

      {error && (
        <p className="crear-expediente-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function CrearExpediente() {
  const router = useRouter();
  const [form, setForm] = useState<Formulario>(FORM_INICIAL);
  const [errores, setErrores] = useState<Errores>({});

  const edad = calcularEdad(form.fechaNacimiento);

  const actualizar = <K extends keyof Formulario>(
    campo: K,
    valor: Formulario[K],
  ) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = () => {
    const nuevos: Errores = {};

    if (!form.nombre.trim()) {
      nuevos.nombre = "Escribe el nombre completo del paciente.";
    }

    if (form.curp && form.curp.length !== 18) {
      nuevos.curp = "El CURP debe tener 18 caracteres.";
    }

    if (form.telefono && form.telefono.length !== 10) {
      nuevos.telefono = "El teléfono debe tener 10 dígitos.";
    }

    if (form.familiarTelefono && form.familiarTelefono.length !== 10) {
      nuevos.familiarTelefono = "El teléfono debe tener 10 dígitos.";
    }

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validar()) return;

    const expediente = {
      ...form,
      edad,
      ingreso: new Date().toISOString(),
    };

    // TODO: enviar `expediente` al backend / API.
    console.log("Expediente creado:", expediente);

    router.push("/admin/mispacientes");
  };

  const ahora = new Date();
  const fechaIngreso = ahora.toLocaleDateString("es-MX");
  const horaIngreso = ahora.toLocaleTimeString("es-MX", { hour12: true });

  return (
    <section className="crear-expediente">
      <form
        className="crear-expediente-card"
        onSubmit={handleSubmit}
        noValidate
      >
        <header className="crear-expediente-header">
          <Image
            src="/assets/logos/logo_drdiaz.svg"
            alt="Dr. José Díaz"
            width={48}
            height={48}
            className="crear-expediente-logo"
          />

          <h1 className="crear-expediente-title">Crear Expediente</h1>
        </header>

        <div className="crear-expediente-ingreso">
          <p>
            <strong>Fecha de Ingreso</strong>{" "}
            <span suppressHydrationWarning>{fechaIngreso}</span>
          </p>
          <p>
            <strong>Hora de Ingreso</strong>{" "}
            <span suppressHydrationWarning>{horaIngreso}</span>
          </p>
        </div>

        <h2 className="crear-expediente-section">1. Datos del Paciente</h2>

        <Campo
          id="nombre"
          label="Nombre Completo"
          requerido
          error={errores.nombre}
        >
          <input
            id="nombre"
            type="text"
            value={form.nombre}
            onChange={(e) => actualizar("nombre", e.target.value)}
            placeholder="Nombre/Apellido Paterno/Apellido Materno"
            className="crear-expediente-input"
            autoComplete="off"
          />
        </Campo>

        <Campo id="fechaNacimiento" label="Fecha de Nacimiento">
          <input
            id="fechaNacimiento"
            type="date"
            value={form.fechaNacimiento}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => actualizar("fechaNacimiento", e.target.value)}
            className="crear-expediente-input crear-expediente-input-short"
          />
        </Campo>

        <Campo id="edad" label="Edad">
          <input
            id="edad"
            type="text"
            value={edad}
            readOnly
            tabIndex={-1}
            className="crear-expediente-input crear-expediente-input-tiny"
          />
        </Campo>

        <fieldset className="crear-expediente-field crear-expediente-sexo m-20">
          <legend className="crear-expediente-label">Sexo</legend>

          <label className="crear-expediente-radio">
            <input
              type="radio"
              name="sexo"
              value="hombre"
              checked={form.sexo === "hombre"}
              onChange={() => actualizar("sexo", "hombre")}
            />
            <span>Hombre</span>
          </label>

          <label className="crear-expediente-radio">
            <input
              type="radio"
              name="sexo"
              value="mujer"
              checked={form.sexo === "mujer"}
              onChange={() => actualizar("sexo", "mujer")}
            />
            <span>Mujer</span>
          </label>
        </fieldset>

        <Campo id="ciudadNacimiento" label="Ciudad (Lugar de Nacimiento)">
          <input
            id="ciudadNacimiento"
            type="text"
            value={form.ciudadNacimiento}
            onChange={(e) => actualizar("ciudadNacimiento", e.target.value)}
            placeholder="Ciudad (Lugar de Nacimiento)"
            className="crear-expediente-input"
          />
        </Campo>

        <Campo id="estadoNacimiento" label="Estado (Lugar de Nacimiento)">
          <input
            id="estadoNacimiento"
            type="text"
            value={form.estadoNacimiento}
            onChange={(e) => actualizar("estadoNacimiento", e.target.value)}
            placeholder="Estado (Lugar de Nacimiento)"
            className="crear-expediente-input"
          />
        </Campo>

        <Campo id="curp" label="CURP" error={errores.curp}>
          <input
            id="curp"
            type="text"
            value={form.curp}
            onChange={(e) =>
              actualizar("curp", e.target.value.toUpperCase().slice(0, 18))
            }
            placeholder="CURP (18 caracteres)"
            className="crear-expediente-input"
            maxLength={18}
            autoComplete="off"
          />
        </Campo>

        <Campo id="residencia" label="Lugar de Residencia">
          <input
            id="residencia"
            type="text"
            value={form.residencia}
            onChange={(e) => actualizar("residencia", e.target.value)}
            placeholder="Ciudad (Lugar de Residencia)"
            className="crear-expediente-input"
          />
        </Campo>

        <Campo id="antecedentes" label="Antecedentes">
          <textarea
            id="antecedentes"
            value={form.antecedentes}
            onChange={(e) => actualizar("antecedentes", e.target.value)}
            placeholder="Antecedentes"
            className="crear-expediente-input crear-expediente-textarea"
            rows={5}
          />
        </Campo>

        <Campo id="telefono" label="Teléfono" error={errores.telefono}>
          <input
            id="telefono"
            type="tel"
            inputMode="numeric"
            value={form.telefono}
            onChange={(e) => actualizar("telefono", soloDigitos(e.target.value))}
            placeholder="Teléfono (10 dígitos)"
            className="crear-expediente-input"
          />
        </Campo>

        <h2 className="crear-expediente-section">
          2. Datos del Familiar responsable
        </h2>

        <Campo id="familiarNombre" label="Nombre Completo del Familiar Responsable">
          <input
            id="familiarNombre"
            type="text"
            value={form.familiarNombre}
            onChange={(e) => actualizar("familiarNombre", e.target.value)}
            placeholder="Nombre Completo del Familiar Responsable"
            className="crear-expediente-input"
          />
        </Campo>

        <Campo
          id="familiarTelefono"
          label="Teléfono del Familiar Responsable"
          error={errores.familiarTelefono}
        >
          <input
            id="familiarTelefono"
            type="tel"
            inputMode="numeric"
            value={form.familiarTelefono}
            onChange={(e) =>
              actualizar("familiarTelefono", soloDigitos(e.target.value))
            }
            placeholder="Teléfono del Familiar Responsable (10 dígitos)"
            className="crear-expediente-input"
          />
        </Campo>

        <div className="crear-expediente-actions">
          <button
            type="button"
            className="crear-expediente-btn crear-expediente-btn-back"
            onClick={() => router.back()}
          >
            Atrás
          </button>

          <button
            type="submit"
            className="crear-expediente-btn crear-expediente-btn-submit"
          >
            Crear Expediente
          </button>
        </div>
      </form>
    </section>
  );
}
