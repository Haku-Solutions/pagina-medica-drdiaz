"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type TipoCatalogo = "cirugia" | "lugar";
type Item = { _id: string; tipo: TipoCatalogo; valor: string };
const normalizar = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("es");

export default function CatalogoNotaInput({ id, tipo, value, onChange }: {
  id: string; tipo: TipoCatalogo; value: string; onChange: (value: string) => void;
}) {
  const [items, setItems] = useState<Item[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const contenedor = useRef<HTMLDivElement>(null);

  const cargar = async () => {
    const response = await fetch("/api/catalogo-nota");
    const result = await response.json();
    if (response.ok && result?.ok) setItems(result.data ?? []);
  };
  useEffect(() => { void cargar(); }, []);
  useEffect(() => {
    const sincronizar = (event: Event) => {
      const item = (event as CustomEvent<Item>).detail;
      if (item?.tipo) setItems((actuales) => actuales.some((actual) => actual._id === item._id) ? actuales : [...actuales, item]);
    };
    const sincronizarEliminacion = (event: Event) => {
      const id = (event as CustomEvent<string>).detail;
      if (id) setItems((actuales) => actuales.filter((item) => item._id !== id));
    };
    window.addEventListener("catalogo-nota:creado", sincronizar);
    window.addEventListener("catalogo-nota:eliminado", sincronizarEliminacion);
    return () => {
      window.removeEventListener("catalogo-nota:creado", sincronizar);
      window.removeEventListener("catalogo-nota:eliminado", sincronizarEliminacion);
    };
  }, []);
  useEffect(() => {
    const cerrar = (event: MouseEvent) => {
      if (!contenedor.current?.contains(event.target as Node)) setAbierto(false);
    };
    document.addEventListener("mousedown", cerrar);
    return () => document.removeEventListener("mousedown", cerrar);
  }, []);

  const opciones = useMemo(() => items.filter((item) => item.tipo === tipo), [items, tipo]);
  const filtradas = opciones.filter((item) => normalizar(item.valor).includes(normalizar(value)));
  const existe = opciones.some((item) => normalizar(item.valor) === normalizar(value));

  const crear = async () => {
    const nuevo = value.trim().replace(/\s+/g, " ");
    if (!nuevo || guardando) return;
    setGuardando(true); setMensaje("");
    try {
      const response = await fetch("/api/catalogo-nota", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tipo, valor: nuevo }) });
      const result = await response.json();
      if (!response.ok || !result?.ok) throw new Error(result?.error || "No se pudo crear la opción.");
      const item = result.data as Item;
      setItems((actuales) => actuales.some((actual) => actual._id === item._id) ? actuales : [...actuales, item]);
      window.dispatchEvent(new CustomEvent<Item>("catalogo-nota:creado", { detail: item }));
      onChange(item.valor); setAbierto(false);
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No se pudo crear la opción."); }
    finally { setGuardando(false); }
  };

  const eliminar = async (event: React.MouseEvent, item: Item) => {
    event.stopPropagation(); setMensaje("");
    try {
      const response = await fetch("/api/catalogo-nota", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item._id }) });
      const result = await response.json();
      if (!response.ok || !result?.ok) throw new Error(result?.error || "No se pudo eliminar la opción.");
      setItems((actuales) => actuales.filter((opcion) => opcion._id !== item._id));
      window.dispatchEvent(new CustomEvent<string>("catalogo-nota:eliminado", { detail: item._id }));
      if (normalizar(value) === normalizar(item.valor)) onChange("");
    } catch (error) { setMensaje(error instanceof Error ? error.message : "No se pudo eliminar la opción."); }
  };

  return <div className="catalogo-nota" ref={contenedor}>
    <input id={id} role="combobox" aria-autocomplete="list" aria-expanded={abierto} aria-controls={`${id}-lista`} value={value}
      onFocus={() => setAbierto(true)} onClick={() => setAbierto(true)}
      onChange={(event) => { onChange(event.target.value); setAbierto(true); setMensaje(""); }}
      onKeyDown={(event) => { if (event.key === "Escape") setAbierto(false); if (event.key === "Enter" && abierto && !existe && value.trim()) { event.preventDefault(); void crear(); } }}
      autoComplete="off" />
    {abierto && <div className="catalogo-nota-lista" id={`${id}-lista`} role="listbox">
      {filtradas.map((item) => <div className="catalogo-nota-opcion" key={item._id} role="option" aria-selected={normalizar(value) === normalizar(item.valor)}>
        <button type="button" className="catalogo-nota-seleccionar" onClick={() => { onChange(item.valor); setAbierto(false); }}>{item.valor}</button>
        <button type="button" className="catalogo-nota-borrar" aria-label={`Eliminar ${item.valor} del catálogo`} title="Eliminar opción" onClick={(event) => void eliminar(event, item)}>×</button>
      </div>)}
      {value.trim() && !existe && <button type="button" className="catalogo-nota-crear" disabled={guardando} onClick={() => void crear()}>
        {guardando ? "Creando…" : `Crear “${value.trim()}”`}
      </button>}
      {!filtradas.length && (!value.trim() || existe) && <span className="catalogo-nota-vacio">No hay opciones disponibles</span>}
    </div>}
    {mensaje && <span className="catalogo-nota-message" role="alert">{mensaje}</span>}
  </div>;
}
