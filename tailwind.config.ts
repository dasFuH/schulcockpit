import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Ampel-Farben für Verständnis-Status
        ampel: {
          gruen: "#22c55e",
          gelb: "#eab308",
          rot: "#ef4444",
        },
        brand: {
          DEFAULT: "#6366f1",
          dark: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
