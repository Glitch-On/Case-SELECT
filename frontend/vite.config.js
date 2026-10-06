import process from 'node:process'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Read VITE_PORT so the dev server port stays documented in .env.example.
  const port = Number(loadEnv(mode, process.cwd(), '').VITE_PORT) || 5173

  return {
    plugins: [react()],
    server: {
      port,
      // Fail loudly instead of silently moving to :5174, where the backend's
      // CORS allow-list (src/app.js) would reject every API call.
      strictPort: true,
    },
  }
})
