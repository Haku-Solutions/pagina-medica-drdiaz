const manifest = {
  id: "/admin/",
  name: "Portal Médico Dr. Díaz",
  short_name: "Portal Médico",
  description: "Portal administrativo para la gestión de pacientes y expedientes.",
  lang: "es-MX",
  dir: "ltr",
  start_url: "/admin/mispacientes",
  scope: "/admin/",
  display: "standalone",
  display_override: ["standalone", "minimal-ui"],
  background_color: "#e8ecef",
  theme_color: "#1c2b48",
  icons: [
    {
      src: "/assets/logos/logo_drdiaz.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any",
    },
  ],
};

export function GET() {
  return new Response(JSON.stringify(manifest), {
    headers: {
      "Content-Type": "application/manifest+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
