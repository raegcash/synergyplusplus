import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 4000,
    strictPort: true,  // Fail if port is already in use
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:9001',
        changeOrigin: true
      }
    }
  }
})




