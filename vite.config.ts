import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { devApi } from './server/devApi.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    devApi(),
  ],
  build: {
    rollupOptions: {
      // /adminpanel is its own page, so static hosts serve it without SPA rewrites.
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        adminpanel: fileURLToPath(new URL('./adminpanel/index.html', import.meta.url)),
        certificate: fileURLToPath(new URL('./certificate/index.html', import.meta.url)),
      },
    },
  },
})
