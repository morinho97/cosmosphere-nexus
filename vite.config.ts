import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['satellite.js', 'gsap', 'framer-motion', 'zustand', 'lucide-react'],
    exclude: ['globe.gl'],
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      external: ['globe.gl'],
      output: {
        globals: { 'globe.gl': 'Globe' },
      },
    },
  },
})
