import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: true, // expose to network
    port: Number(process.env.PORT) || 5173, // use Render's PORT env
  },
  build: {
    outDir: 'dist', // default Vite build folder
  },
})
