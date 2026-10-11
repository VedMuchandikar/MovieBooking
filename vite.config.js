import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:4000',
      '/movies': 'http://localhost:4000',
      '/theatres': 'http://localhost:4000',
      '/screens': 'http://localhost:4000',
      '/seats': 'http://localhost:4000',
    },
  },
})
