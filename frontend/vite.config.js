import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    '__API_URL__': "import.meta.env.PROD ? 'https://hbn-24.vercel.app' : ''"
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
