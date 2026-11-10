"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import "../crearExpediente/CrearExpediente.css";
import "./EditarExpediente.css";

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

// Convierte el documento de MongoDB (modelo ExpedienteMedico) al formato del formulario.
function aFormulario(doc: Record<string, unknown>): Formulario {
  const str = (v: unknown) => (v === null || v === undefined ? "" : String(v));

  return {
    nombre: str(doc.nombreCompleto),
    fechaNacimiento: str(doc.fechaNacimiento).slice(0, 10),
    sexo: doc.sexo === "M" ? "hombre" : doc.sexo === "F" ? "mujer" : "",
    ciudadNacimiento: str(doc.municipio),
    estadoNacimiento: str(doc.estado),
    curp: str(doc.curp),
    residencia: str(doc.lugarResidencia),
    antecedentes: str(doc.antecedentes),
    telefono: str(doc.telefono),
    familiarNombre: str(doc.familiarResponsable),
    familiarTelefono: str(doc.telefonoFamiliar),
  };
}

type CampoProps = {
  id: string;
  label: string;
  requerido?: boolean;
  error?: string;
  guardado?: string;
  children: ReactNode;
};

function Campo({ id, label, requerido, error, guardado, children }: CampoProps) {
  return (
    <div className="crear-expediente-field">
      <label htmlFor={id} className="crear-expediente-label">
        {label}
        {requerido && <span className="crear-expediente-required">*</span>}
      </label>

      {children}

      {guardado !== undefined && (
        <p className="editar-expediente-anterior">
          <span>Dato original:</span> {guardado}
        </p>
      )}

      {error && (
        <p className="crear-expediente-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function EditarExpediente({ id }: { id: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Formulario>(FORM_INICIAL);
  const [original, setOriginal] = useState<Formulario | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [ingreso, setIngreso] = useState<Date | null>(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorServidor, setErrorServidor] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      try {
        const res = await fetch(`/api/expedientes/${id}`);
        const json = await res.json().catch(() => null);

        if (cancelado) return;

        if (!res.ok || !json) {
          setErrorCarga(
            res.status === 404
              ? "No se encontró el expediente."
              : "No se pudo cargar el expediente.",
          );
          return;
        }

        // Acepta { ok, data: {...} }, { data: { expediente: {...} } } o el documento directo.
        const data = (json.data ?? json) as Record<string, unknown>;
        const doc = (data.expediente ?? data.expedienteMedico ?? data) as Record<
          string,
          unknown
        >;

        const inicial = aFormulario(doc);
        setForm(inicial);
        setOriginal(inicial);

        const creado = new Date(String(doc.createdAt ?? ""));
        setIngreso(Number.isNaN(creado.getTime()) ? null : creado);
      } catch {
        if (!cancelado) setErrorCarga("Sin conexión con el servidor.");
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();

    return () => {
      cancelado = true;
    };
  }, [id]);

  const edad = calcularEdad(form.fechaNacimiento);

  // Devuelve el valor guardado solo cuando el campo ya fue modificado.
  const guardado = (campo: keyof Formulario): string | undefined => {
    if (!original || form[campo] === original[campo]) return undefined;

    const valor = original[campo];
    if (!valor) return "(vacío)";

    if (campo === "fechaNacimiento") {
      const [anio, mes, dia] = valor.split("-");
      return `${dia}/${mes}/${anio}`;
    }

    if (campo === "sexo") return valor === "hombre" ? "Hombre" : "Mujer";

    return valor;
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (enviando || !validar()) return;

    setEnviando(true);
    setErrorServidor("");

    try {
      const res = await fetch(`/api/expedientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        if (data?.campos) setErrores(data.campos);
        setErrorServidor(data?.error ?? "No se pudieron guardar los cambios.");
        return;
      }

      router.push("/admin/mispacientes");
    } catch {
      setErrorServidor("Sin conexión con el servidor. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return (
      <section className="crear-expediente">
        <div className="crear-expediente-card">
          <p className="editar-expediente-estado" role="status">
            Cargando expediente...
          </p>
        </div>
      </section>
    );
  }

  if (errorCarga) {
    return (
      <section className="crear-expediente">
        <div className="crear-expediente-card">
          <p className="editar-expediente-estado" role="alert">
            {errorCarga}
          </p>

          <div className="crear-expediente-actions">
            <button
              type="button"
              className="crear-expediente-btn crear-expediente-btn-back"
              onClick={() => router.push("/admin/mispacientes")}
            >
              Volver
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="crear-expediente">
      <form
        className="crear-expediente-card"
        onSubmit={handleSubmit}
        noValidate
      >
        <header className="crear-expediente-header">
          <h1 className="crear-expediente-title">Editar Expediente</h1>
        </header>

        {ingreso && (
          <div className="crear-expediente-ingreso">
            <p>
              <strong>Fecha de Ingreso</strong>{" "}
              <span suppressHydrationWarning>
                {ingreso.toLocaleDateString("es-MX")}
              </span>
            </p>
            <p>
              <strong>Hora de Ingreso</strong>{" "}
              <span suppressHydrationWarning>
                {ingreso.toLocaleTimeString("es-MX", { hour12: true })}
              </span>
            </p>
          </div>
        )}

        <h2 className="crear-expediente-section">1. Datos del Paciente</h2>

        <Campo
          id="nombre"
          label="Nombre Completo"
          requerido
          error={errores.nombre}
          guardado={guardado("nombre")}
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

        <Campo
          id="fechaNacimiento"
          label="Fecha de Nacimiento"
          error={errores.fechaNacimiento}
          guardado={guardado("fechaNacimiento")}
        >
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

        <fieldset className="crear-expediente-field crear-expediente-sexo">
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

          {guardado("sexo") !== undefined && (
            <p className="editar-expediente-anterior">
              <span>Guardado:</span> {guardado("sexo")}
            </p>
          )}
        </fieldset>

        <Campo
          id="ciudadNacimiento"
          label="Ciudad (Lugar de Nacimiento)"
          guardado={guardado("ciudadNacimiento")}
        >
          <input
            id="ciudadNacimiento"
            type="text"
            value={form.ciudadNacimiento}
            onChange={(e) => actualizar("ciudadNacimiento", e.target.value)}
            placeholder="Ciudad (Lugar de Nacimiento)"
            className="crear-expediente-input"
          />
        </Campo>

        <Campo
          id="estadoNacimiento"
          label="Estado (Lugar de Nacimiento)"
          guardado={guardado("estadoNacimiento")}
        >
          <input
            id="estadoNacimiento"
            type="text"
            value={form.estadoNacimiento}
            onChange={(e) => actualizar("estadoNacimiento", e.target.value)}
            placeholder="Estado (Lugar de Nacimiento)"
            className="crear-expediente-input"
          />
        </Campo>

        <Campo
          id="curp"
          label="CURP"
          error={errores.curp}
          guardado={guardado("curp")}
        >
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

        <Campo
          id="residencia"
          label="Lugar de Residencia"
          guardado={guardado("residencia")}
        >
          <input
            id="residencia"
            type="text"
            value={form.residencia}
            onChange={(e) => actualizar("residencia", e.target.value)}
            placeholder="Ciudad (Lugar de Residencia)"
            className="crear-expediente-input"
          />
        </Campo>

        <Campo
          id="antecedentes"
          label="Antecedentes"
          guardado={guardado("antecedentes")}
        >
          <textarea
            id="antecedentes"
            value={form.antecedentes}
            onChange={(e) => actualizar("antecedentes", e.target.value)}
            placeholder="Antecedentes"
            className="crear-expediente-input crear-expediente-textarea"
            rows={5}
          />
        </Campo>

        <Campo
          id="telefono"
          label="Teléfono"
          error={errores.telefono}
          guardado={guardado("telefono")}
        >
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

        <Campo
          id="familiarNombre"
          label="Nombre Completo del Familiar Responsable"
          guardado={guardado("familiarNombre")}
        >
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
          guardado={guardado("familiarTelefono")}
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

        {errorServidor && (
          <p className="crear-expediente-error" role="alert">
            {errorServidor}
          </p>
        )}

        <div className="crear-expediente-actions">
          <button
            type="button"
            className="crear-expediente-btn editar-expediente-btn-cancel"
            onClick={() => router.back()}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="crear-expediente-btn crear-expediente-btn-submit"
            disabled={enviando}
          >
            {enviando ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </section>
  );
}
