import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Only the read-only reviews endpoint; everything else under /api stays local.
    proxy: {
      '/api/reviews': { target: 'https://www.moovefitness.gr', changeOrigin: true },
    },
  },
})
