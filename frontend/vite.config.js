import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [react(), tailwindcss()],
    define: {
      '__API_URL__': JSON.stringify(mode === 'production' ? 'https://hbn24.onrender.com' : '')
    },

    server: {
      proxy: {
        '/api': 'http://localhost:5000',
        '/sitemap.xml': 'http://localhost:5000',
        '/news-sitemap.xml': 'http://localhost:5000'
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor';
              }
              if (id.includes('lucide-react') || id.includes('react-icons')) {
                return 'icons';
              }
              if (id.includes('jodit-react')) {
                return 'editor';
              }
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  }
})
