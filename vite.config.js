import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'                          // ✅ 추가
import { fileURLToPath } from 'url'              // ✅ 추가

const __dirname = path.dirname(fileURLToPath(import.meta.url))  // ✅ 추가

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})