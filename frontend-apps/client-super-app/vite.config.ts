import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,  // Updated to match expected port
    host: true,
    strictPort: true,  // Fail if port is already in use - prevents conflicts
    proxy: {
      // Auth endpoints go to Customer Identity Service
      '/api/v1/auth': {
        target: 'http://localhost:8081',  // Customer Identity Service
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Auth proxy error:', err.message);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('[Auth] →', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[Auth] ←', proxyRes.statusCode, req.url);
          });
        },
      },
      // All other API endpoints go to Marketplace API (which may route to other services)
      '/api': {
        target: 'http://localhost:8085',  // Marketplace API
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, _res) => {
            console.log('API proxy error:', err.message, 'for', req.url);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('[API] →', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('[API] ←', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
})
