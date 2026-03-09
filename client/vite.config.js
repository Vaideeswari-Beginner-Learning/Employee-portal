import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('--- Proxy Error ---', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('--- Proxy Request ---', req.method, req.url);
          });
        }
      },
      '/uploads': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      }
    }
  }
})
