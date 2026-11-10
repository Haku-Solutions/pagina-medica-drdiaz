"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HiUsers, HiXMark } from "react-icons/hi2";
import GraficaAnillo from "./graficas/GraficaAnillo";
import GraficaArea from "./graficas/GraficaArea";
import GraficaBarrasVertical from "./graficas/GraficaBarrasVertical";
import GraficaHistograma from "./graficas/GraficaHistograma";
import GraficaPastelReportes from "./graficas/GraficaPastelReportes";
import type { DatoGrafica } from "./graficas/utils";
import "./inicio.css";

interface DesglosePorTipo {
  tipo: string;
  etiqueta: string;
  valor: number;
}

interface DesglosePorLugar {
  lugar: string;
  etiqueta: string;
  valor: number;
}

const ETIQUETA_SEXO: Record<string, string> = {
  M: "Hombres",
  F: "Mujeres",
};

interface Estadisticas {
  totalExpedientes: number;
  totalCirugias: number;
  reportesLlenados: number;
  reportesTotales: number;
  cirugiasMesActual?: number;
  cirugiasPorTipo: DatoGrafica[];
  lugaresMasComunes: DatoGrafica[];
  porSexo: DatoGrafica[];
  cirugiasPorMes: DatoGrafica[];
  cirugiasPorTipoMes: DesglosePorTipo[];
  cirugiasPorLugarMes: DesglosePorLugar[];
  porEdad: DatoGrafica[];
}

export default function Inicio() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);
  const [lugarSeleccionado, setLugarSeleccionado] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);

    try {
      const response = await fetch("/api/estadisticas", { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error ?? "No se pudieron cargar las estadísticas.");
      }

      setEstadisticas(payload.data as Estadisticas);
    } catch (fallo) {
      setError(
        fallo instanceof Error
          ? fallo.message
          : "No se pudieron cargar las estadísticas.",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  /** Si el tipo elegido deja de existir (por ejemplo tras recargar), se limpia. */
  useEffect(() => {
    if (!tipoSeleccionado || !estadisticas) return;

    const sigueExistiendo = estadisticas.cirugiasPorTipo.some(
      (dato) => dato.etiqueta === tipoSeleccionado,
    );

    if (!sigueExistiendo) setTipoSeleccionado(null);
  }, [estadisticas, tipoSeleccionado]);

  /** Si el lugar elegido deja de existir (por ejemplo tras recargar), se limpia. */
  useEffect(() => {
    if (!lugarSeleccionado || !estadisticas) return;

    const sigueExistiendo = estadisticas.lugaresMasComunes.some(
      (dato) => dato.etiqueta === lugarSeleccionado,
    );

    if (!sigueExistiendo) setLugarSeleccionado(null);
  }, [estadisticas, lugarSeleccionado]);

  /**
   * Al elegir un tipo de cirugía se arma su evolución mensual
   * (ventana de 12 meses).
   */
  const detallePorTipo = useMemo(() => {
    if (!estadisticas || !tipoSeleccionado) {
      return { porMes: [] as DatoGrafica[] };
    }

    const porMes = new Map<string, number>();
    for (const item of estadisticas.cirugiasPorTipoMes) {
      if (item.tipo !== tipoSeleccionado) continue;
      porMes.set(item.etiqueta, (porMes.get(item.etiqueta) ?? 0) + item.valor);
    }

    const meses = estadisticas.cirugiasPorMes.map((mes) => ({
      etiqueta: mes.etiqueta,
      valor: porMes.get(mes.etiqueta) ?? 0,
    }));

    return { porMes: meses };
  }, [estadisticas, tipoSeleccionado]);

  /** Al elegir un lugar se arma su evolución mensual (ventana de 12 meses). */
  const detallePorLugar = useMemo(() => {
    if (!estadisticas || !lugarSeleccionado) {
      return { porMes: [] as DatoGrafica[] };
    }

    const porMes = new Map<string, number>();
    for (const item of estadisticas.cirugiasPorLugarMes) {
      if (item.lugar !== lugarSeleccionado) continue;
      porMes.set(item.etiqueta, (porMes.get(item.etiqueta) ?? 0) + item.valor);
    }

    const meses = estadisticas.cirugiasPorMes.map((mes) => ({
      etiqueta: mes.etiqueta,
      valor: porMes.get(mes.etiqueta) ?? 0,
    }));

    return { porMes: meses };
  }, [estadisticas, lugarSeleccionado]);

  const porSexo = useMemo(
    () =>
      (estadisticas?.porSexo ?? []).map((dato) => ({
        ...dato,
        etiqueta: ETIQUETA_SEXO[dato.etiqueta] ?? dato.etiqueta,
      })),
    [estadisticas],
  );

  const totalCirugiasMes = useMemo(
    () =>
      estadisticas?.cirugiasPorMes.reduce((suma, dato) => suma + dato.valor, 0) ?? 0,
    [estadisticas],
  );

  /** Pulsar una barra del histograma selecciona ese tipo de cirugía. */
  const seleccionarTipo = useCallback((tipo: string) => {
    setTipoSeleccionado((actual) => (actual === tipo ? null : tipo));
  }, []);

  /** Pulsar una barra de lugares selecciona esa sede. */
  const seleccionarLugar = useCallback((lugar: string) => {
    setLugarSeleccionado((actual) => (actual === lugar ? null : lugar));
  }, []);

  return (
    <section className="inicio">
      <header className="inicio-header">
        <div className="inicio-titulos">
          <h1 className="inicio-titulo" style={{ color: "#306DBB", lineHeight: 1 }}>BIENVENIDO</h1>
          <p className="inicio-subtitulo" style={{ color: "#000000", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "clamp(1.6rem, 4vw, 2.6rem)", marginTop: "-0.1rem" }}>Dr. José Díaz</p>
        </div>

        <button
          type="button"
          className="inicio-actualizar"
          onClick={() => router.push("/admin/mispacientes")}
        >
          <HiUsers aria-hidden="true" />
          <span style={{ textTransform: "uppercase" }}>Mis pacientes</span>
        </button>
      </header>

      {error && (
        <div className="inicio-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => void cargar()}>
            Reintentar
          </button>
        </div>
      )}

      {cargando && !estadisticas ? (
        <p className="inicio-cargando">Cargando estadísticas…</p>
      ) : (
        <>
          <div className="inicio-tarjetas">
            <article className="inicio-tarjeta">
              <p className="inicio-tarjeta-valor">
                {estadisticas?.totalExpedientes ?? 0}
              </p>
              <p className="inicio-tarjeta-etiqueta">Expedientes</p>
            </article>

            <article className="inicio-tarjeta">
              <p className="inicio-tarjeta-valor">
                {estadisticas?.cirugiasMesActual ?? 0}
              </p>
              <p className="inicio-tarjeta-etiqueta">Cirugías del mes actual</p>
            </article>

            <article className="inicio-tarjeta">
              <p className="inicio-tarjeta-valor">
                {estadisticas?.totalCirugias ?? 0}
              </p>
              <p className="inicio-tarjeta-etiqueta">Cirugías</p>
            </article>

            <article className="inicio-tarjeta">
              <p className="inicio-tarjeta-valor">
                {estadisticas?.lugaresMasComunes.length ?? 0}
              </p>
              <p className="inicio-tarjeta-etiqueta">Sedes quirúrgicas</p>
            </article>
          </div>

          <div className="inicio-grilla">
            <article className="inicio-panel">
              <h2 className="inicio-panel-titulo" style={{ flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                <span>REPORTES</span>
                <span>LLENADOS</span>
              </h2>
              <p className="inicio-panel-subtitulo">
                Notas operatorias con todos los campos completos vs. las que
                aún tienen campos pendientes.
              </p>
              <GraficaPastelReportes
                llenados={estadisticas?.reportesLlenados ?? 0}
                total={estadisticas?.reportesTotales ?? estadisticas?.totalExpedientes ?? 0}
                etiquetaVacia="Sin reportes registrados."
              />
            </article>

            <article className="inicio-panel">
              <h2 className="inicio-panel-titulo" style={{ flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                <span>CIRUGÍAS POR</span>
                <span>MES</span>
              </h2>
              <p className="inicio-panel-subtitulo">
                Evolución mensual de las notas operatorias registradas.
              </p>
              <GraficaArea
                datos={estadisticas?.cirugiasPorMes ?? []}
                etiquetaVacia="Todavía no hay cirugías registradas."
              />
            </article>

            <article className="inicio-panel">
              <div className="inicio-panel-cabecera">
                <div>
                  <h2 className="inicio-panel-titulo" style={{ flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                    {tipoSeleccionado ? (
                      <>
                        <span>CIRUGÍAS POR</span>
                        <span>TIPO: {tipoSeleccionado}</span>
                      </>
                    ) : (
                      <>
                        <span>CIRUGÍAS POR</span>
                        <span>TIPO</span>
                      </>
                    )}
                  </h2>
                  <p className="inicio-panel-subtitulo">
                    {tipoSeleccionado
                      ? "Evolución mensual de este tipo de cirugía en los últimos 12 meses."
                      : "Selecciona un tipo de cirugía para ver su evolución mensual."}
                  </p>
                </div>

                {tipoSeleccionado ? (
                  <button
                    type="button"
                    className="inicio-selector-select"
                    style={{ padding: "0 0.7rem", gap: "0.25rem" }}
                    onClick={() => setTipoSeleccionado(null)}
                  >
                    <HiXMark aria-hidden="true" />
                    <span>Ver todas</span>
                  </button>
                ) : (
                  <select
                    className="inicio-selector-select"
                    value={tipoSeleccionado ?? ""}
                    onChange={(evento) =>
                      setTipoSeleccionado(evento.target.value || null)
                    }
                  >
                    <option value="">Seleccionar...</option>
                    {(estadisticas?.cirugiasPorTipo ?? []).map((dato) => (
                      <option key={dato.etiqueta} value={dato.etiqueta}>
                        {dato.etiqueta} ({dato.valor})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {tipoSeleccionado ? (
                <GraficaArea
                  datos={detallePorTipo.porMes}
                  etiquetaVacia="Sin cirugías de este tipo en los últimos 12 meses."
                />
              ) : (
                <GraficaHistograma
                  datos={estadisticas?.cirugiasPorTipo ?? []}
                  etiquetaVacia="Todavía no hay tipos de cirugía registrados."
                  seleccionada={tipoSeleccionado}
                  onSeleccionar={seleccionarTipo}
                />
              )}
            </article>
            <article className="inicio-panel">
              <div className="inicio-panel-cabecera">
                <div>
                  <h2 className="inicio-panel-titulo" style={{ flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                    {lugarSeleccionado ? (
                      <>
                        <span>LUGARES MÁS</span>
                        <span>FRECUENTES: {lugarSeleccionado}</span>
                      </>
                    ) : (
                      <>
                        <span>LUGARES MÁS</span>
                        <span>FRECUENTES</span>
                      </>
                    )}
                  </h2>
                  <p className="inicio-panel-subtitulo">
                    {lugarSeleccionado
                      ? "Evolución mensual de cirugías en esta sede."
                      : "Selecciona una sede para ver su evolución mensual."}
                  </p>
                </div>

                {lugarSeleccionado ? (
                  <button
                    type="button"
                    className="inicio-selector-select"
                    style={{ padding: "0 0.7rem", gap: "0.25rem" }}
                    onClick={() => setLugarSeleccionado(null)}
                  >
                    <HiXMark aria-hidden="true" />
                    <span>Ver todas</span>
                  </button>
                ) : (
                  <select
                    className="inicio-selector-select"
                    value={lugarSeleccionado ?? ""}
                    onChange={(evento) =>
                      setLugarSeleccionado(evento.target.value || null)
                    }
                  >
                    <option value="">Seleccionar...</option>
                    {(estadisticas?.lugaresMasComunes ?? []).map((dato) => (
                      <option key={dato.etiqueta} value={dato.etiqueta}>
                        {dato.etiqueta} ({dato.valor})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {lugarSeleccionado ? (
                <GraficaArea
                  datos={detallePorLugar.porMes}
                  etiquetaVacia="Sin cirugías en esta sede en los últimos 12 meses."
                />
              ) : (
                <GraficaHistograma
                  datos={estadisticas?.lugaresMasComunes ?? []}
                  etiquetaVacia="Todavía no hay lugares registrados."
                  seleccionada={lugarSeleccionado}
                  onSeleccionar={seleccionarLugar}
                />
              )}
            </article>

            <article className="inicio-panel">
              <h2 className="inicio-panel-titulo" style={{ flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                <span>DISTRIBUCIÓN POR</span>
                <span>SEXO</span>
              </h2>
              <p className="inicio-panel-subtitulo">
                Pacientes registrados según su sexo.
              </p>
              <GraficaAnillo
                datos={porSexo}
                centro={String(estadisticas?.totalExpedientes ?? 0)}
                centroSub="Pacientes"
                etiquetaVacia="Todavía no hay pacientes con sexo registrado."
              />
            </article>

            <article className="inicio-panel inicio-panel-ancho">
              <h2 className="inicio-panel-titulo" style={{ flexDirection: "column", alignItems: "flex-start", lineHeight: 1.1 }}>
                <span>DISTRIBUCIÓN POR</span>
                <span>EDAD</span>
              </h2>
              <p className="inicio-panel-subtitulo">
                Pacientes según rango de edad.
              </p>
              <GraficaBarrasVertical
                datos={estadisticas?.porEdad ?? []}
                etiquetaVacia="Todavía no hay pacientes con edad registrada."
              />
            </article>
          </div>
        </>
      )}
    </section>
  );
}
