import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { createLogger, defineConfig } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BACKEND_URL = process.env.VITE_API_URL || 'https://avalanche-task.onrender.com'

// Suppress ECONNREFUSED proxy error spam when the backend is offline
const logger = createLogger()
const originalError = logger.error
logger.error = (msg, options) => {
  if (
    typeof msg === 'string' &&
    msg.includes('http proxy error') &&
    (msg.includes('ECONNREFUSED') ||
      options?.error?.code === 'ECONNREFUSED' ||
      options?.error?.message?.includes('ECONNREFUSED'))
  ) {
    return
  }
  originalError(msg, options)
}

const proxyTarget = {
  target: BACKEND_URL,
  changeOrigin: true,
  secure: false,
}

// https://vite.dev/config/
export default defineConfig({
  customLogger: logger,
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5174,
    proxy: {
      '/api': proxyTarget,
      '/movies': proxyTarget,
      '/theatres': proxyTarget,
      '/screens': proxyTarget,
      '/seats': proxyTarget,
    },
  },
})
