import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api/marketplace': {
        target: 'http://localhost:8085',
        changeOrigin: true
      }
    }
  }
})


