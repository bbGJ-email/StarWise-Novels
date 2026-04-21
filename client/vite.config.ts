import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['novel.h.xingk.xyz', 'novel.xingk.xyz'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      },
      '/public': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
})
