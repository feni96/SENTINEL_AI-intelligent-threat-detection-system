import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
  optimizeDeps: {
    include: [
      'socket.io-client',
      'engine.io-client',
      'engine.io-parser'
    ],
    force: true
  },
  server: {
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: false
    }
  }
})
