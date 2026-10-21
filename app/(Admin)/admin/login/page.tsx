"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [contraseña, setContraseña] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const usuarioLimpio = usuario.trim();
    if (!usuarioLimpio || !contraseña) {
      setError("Ingresa tu usuario y contraseña.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreUsuario: usuarioLimpio, contraseña }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "No se pudo iniciar sesión.");
        setEnviando(false);
        return;
      }

      const destino = new URLSearchParams(window.location.search).get(
        "redirect"
      );
      router.replace(destino?.startsWith("/") ? destino : "/admin/inicio");
      router.refresh();
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
      setEnviando(false);
    }
  };

  return (
    <main className="flex min-h-dvh flex-col bg-[linear-gradient(180deg,#E8ECEF_0%,#BDC6FF_100%)]">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-12">
        <Image 
                        className="navbar-logo"
                        src="/assets/logos/logo_drdiaz.svg"
                        alt="Logo Dr. José Díaz - Cirujano General"
                        width={100}
                        height={100}
                    />

        <h1 className="mt-7 max-w-[17rem] text-center text-[17px] font-bold uppercase leading-snug tracking-wide text-[#1C2B48]">
          Bienvenido al portal de expediente médico
        </h1>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-9 w-full max-w-sm space-y-5"
        >
          <div>
            <label
              htmlFor="usuario"
              className="mb-2 block text-sm font-semibold text-[#1C2B48]"
            >
              Usuario
            </label>
            <input
              id="usuario"
              name="usuario"
              type="text"
              autoComplete="username"
              enterKeyHint="next"
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              placeholder="Ingresa tu usuario"
              className="w-full rounded-2xl bg-[#AED4F8] px-4 py-3.5 text-base text-[#1C2B48] outline-none transition placeholder:text-[#5b7a99] focus:ring-2 focus:ring-[#1C2B48]/40"
            />
          </div>

          <div>
            <label
              htmlFor="contrasena"
              className="mb-2 block text-sm font-semibold text-[#1C2B48]"
            >
              Contraseña
            </label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              autoComplete="current-password"
              enterKeyHint="go"
              value={contraseña}
              onChange={(event) => setContraseña(event.target.value)}
              placeholder="Ingresa tu contraseña"
              className="w-full rounded-2xl bg-[#AED4F8] px-4 py-3.5 text-base text-[#1C2B48] outline-none transition placeholder:text-[#5b7a99] focus:ring-2 focus:ring-[#1C2B48]/40"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-full bg-[#1C2B48] py-3.5 text-base font-semibold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60"
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>

          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-red-100 px-4 py-3 text-center text-sm font-semibold text-red-700"
            >
              {error}
            </p>
          )}
        </form>
      </div>

      <footer className="px-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-4 text-center">
        <Link
          href="/aviso-privacidad"
          onClick={() =>
            console.log("Navegando a Aviso de Privacidad...")
          }
          className="text-xs font-bold text-[#1C2B48] underline-offset-4 transition hover:opacity-70 hover:underline"
        >
          Aviso de Privacidad de terminos y condiciones
        </Link>
      </footer>
    </main>
  );
}
 