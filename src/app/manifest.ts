import type { MetadataRoute } from "next";

/** PWA-Manifest: erlaubt „Zum Startbildschirm hinzufügen" auf dem Handy. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Schul-Cockpit",
    short_name: "Cockpit",
    description: "Dein Überblick: Hausaufgaben, Themen & Klassenarbeiten",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#6366f1",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
