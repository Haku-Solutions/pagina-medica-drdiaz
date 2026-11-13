"use client";

import { useEffect } from "react";

export default function PwaRegistrar() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/admin/sw.js", { scope: "/admin/", updateViaCache: "none" })
      .catch(() => {
        // La navegación normal sigue disponible si el navegador no permite SW.
      });
  }, []);

  return null;
}
