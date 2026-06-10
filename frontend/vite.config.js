import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      '__API_URL__': JSON.stringify(mode === 'production' ? 'https://hbn-24.vercel.app' : '')
    },

    server: {
      proxy: {
        '/api': 'http://localhost:5000',
        '/sitemap.xml': 'http://localhost:5000'
      }
    }
  }
})
