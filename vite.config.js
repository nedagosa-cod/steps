import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import exportExePlugin from './plugins/exportExePlugin.js'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    exportExePlugin(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  }
})
