"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  HiArrowPath,
  HiChartBar,
  HiDocumentText,
  HiMapPin,
  HiScissors,
  HiUserGroup,
  HiXMark,
} from "react-icons/hi2";
import GraficaAnillo from "./graficas/GraficaAnillo";
import GraficaArea from "./graficas/GraficaArea";
import GraficaBarras from "./graficas/GraficaBarras";
import GraficaHistograma from "./graficas/GraficaHistograma";
import type { DatoGrafica } from "./graficas/utils";
import "./inicio.css";

interface DesglosePorTipo {
  tipo: string;
  etiqueta: string;
  valor: number;
}

interface Estadisticas {
  totalExpedientes: number;
  totalCirugias: number;
  cirugiasPorTipo: DatoGrafica[];
  lugaresMasComunes: DatoGrafica[];
  porSexo: DatoGrafica[];
  cirugiasPorMes: DatoGrafica[];
  cirugiasPorTipoMes: DesglosePorTipo[];
}

const ETIQUETA_SEXO: Record<string, string> = {
  M: "Hombres",
  F: "Mujeres",
};

export default function Inicio() {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);

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

  const porSexo = useMemo(
    () =>
      (estadisticas?.porSexo ?? []).map((dato) => ({
        ...dato,
        etiqueta: ETIQUETA_SEXO[dato.etiqueta] ?? dato.etiqueta,
      })),
    [estadisticas],
  );

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

  const totalCirugiasMes = useMemo(
    () =>
      estadisticas?.cirugiasPorMes.reduce((suma, dato) => suma + dato.valor, 0) ?? 0,
    [estadisticas],
  );

  /** Pulsar una barra del histograma selecciona ese tipo de cirugía. */
  const seleccionarTipo = useCallback((tipo: string) => {
    setTipoSeleccionado((actual) => (actual === tipo ? null : tipo));
  }, []);

  return (
    <section className="inicio">
      <header className="inicio-header">
        <Image
          className="inicio-logo"
          src="/assets/logos/logo_drdiaz.svg"
          alt="Dr. José Díaz"
          width={56}
          height={56}
          priority
        />

        <div className="inicio-titulos">
          <h1 className="inicio-titulo">INICIO</h1>
          <p className="inicio-subtitulo">
            Resumen de la actividad quirúrgica y los expedientes registrados.
          </p>
        </div>

        <button
          type="button"
          className="inicio-actualizar"
          onClick={() => void cargar()}
          disabled={cargando}
        >
          <HiArrowPath aria-hidden="true" className={cargando ? "girando" : ""} />
          <span>Actualizar</span>
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
              <HiDocumentText className="inicio-tarjeta-icono" aria-hidden="true" />
              <p className="inicio-tarjeta-valor">
                {estadisticas?.totalExpedientes ?? 0}
              </p>
              <p className="inicio-tarjeta-etiqueta">Expedientes</p>
            </article>

            <article className="inicio-tarjeta">
              <HiScissors className="inicio-tarjeta-icono" aria-hidden="true" />
              <p className="inicio-tarjeta-valor">
                {estadisticas?.totalCirugias ?? 0}
              </p>
              <p className="inicio-tarjeta-etiqueta">Cirugías</p>
            </article>

            <article className="inicio-tarjeta">
              <HiChartBar className="inicio-tarjeta-icono" aria-hidden="true" />
              <p className="inicio-tarjeta-valor">{totalCirugiasMes}</p>
              <p className="inicio-tarjeta-etiqueta">Cirugías (12 meses)</p>
            </article>

            <article className="inicio-tarjeta">
              <HiMapPin className="inicio-tarjeta-icono" aria-hidden="true" />
              <p className="inicio-tarjeta-valor">
                {estadisticas?.lugaresMasComunes.length ?? 0}
              </p>
              <p className="inicio-tarjeta-etiqueta">Sedes quirúrgicas</p>
            </article>
          </div>

          <div className="inicio-grilla">
            <article className="inicio-panel inicio-panel-ancho">
              <h2 className="inicio-panel-titulo">Cirugías por mes</h2>
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
                  <h2 className="inicio-panel-titulo">
                    <HiScissors className="inicio-panel-icono" aria-hidden="true" />
                    Cirugías por tipo
                  </h2>
                  <p className="inicio-panel-subtitulo">
                    Pulsa una barra para ver el detalle de esa cirugía.
                  </p>
                </div>

                <label className="inicio-selector">
                  <span className="inicio-selector-etiqueta">
                    Ver histograma por cirugía
                  </span>
                  <select
                    className="inicio-selector-select"
                    value={tipoSeleccionado ?? ""}
                    onChange={(evento) =>
                      setTipoSeleccionado(evento.target.value || null)
                    }
                  >
                    <option value="">Todas las cirugías</option>
                    {(estadisticas?.cirugiasPorTipo ?? []).map((dato) => (
                      <option key={dato.etiqueta} value={dato.etiqueta}>
                        {dato.etiqueta} ({dato.valor})
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <GraficaHistograma
                datos={estadisticas?.cirugiasPorTipo ?? []}
                etiquetaVacia="Todavía no hay tipos de cirugía registrados."
                seleccionada={tipoSeleccionado}
                onSeleccionar={seleccionarTipo}
              />
            </article>

            {tipoSeleccionado && (
              <article className="inicio-panel inicio-panel-ancho">
                <div className="inicio-panel-cabecera">
                  <div>
                    <h2 className="inicio-panel-titulo">
                      <HiChartBar className="inicio-panel-icono" aria-hidden="true" />
                      Histograma de {tipoSeleccionado}
                    </h2>
                    <p className="inicio-panel-subtitulo">
                      Evolución mensual de este tipo de cirugía en los últimos 12
                      meses.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="inicio-limpiar"
                    onClick={() => setTipoSeleccionado(null)}
                  >
                    <HiXMark aria-hidden="true" />
                    <span>Quitar selección</span>
                  </button>
                </div>

                <GraficaArea
                  datos={detallePorTipo.porMes}
                  etiquetaVacia="Sin cirugías de este tipo en los últimos 12 meses."
                />
              </article>
            )}

            <article className="inicio-panel">
              <h2 className="inicio-panel-titulo">
                <HiMapPin className="inicio-panel-icono" aria-hidden="true" />
                Lugares más frecuentes
              </h2>
              <p className="inicio-panel-subtitulo">
                Sedes donde se realizaron las cirugías.
              </p>
              <GraficaBarras
                datos={estadisticas?.lugaresMasComunes ?? []}
                etiquetaVacia="Todavía no hay lugares registrados."
              />
            </article>

            <article className="inicio-panel">
              <h2 className="inicio-panel-titulo">
                <HiUserGroup className="inicio-panel-icono" aria-hidden="true" />
                Distribución por sexo
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
          </div>
        </>
      )}
    </section>
  );
}
