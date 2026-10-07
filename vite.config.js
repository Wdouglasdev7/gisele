import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // o CSS entra inteiro dentro do HTML no pré-render (scripts/prerender.mjs)
    cssCodeSplit: false,
  },
  server: { watch: { ignored: ['**/dist/**', '**/.ssr/**'] } },
})
