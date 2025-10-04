import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // needed for dev server, optional for preview
    port: Number(process.env.PORT) || 5173,
  },
  preview: {
    host: true, // allow network hosts
    port: Number(process.env.PORT) || 4173,
    allowedHosts: ["evotechs-crm-front-end.onrender.com"], // add your domain here
  },
  build: {
    outDir: "dist",
  },
});
