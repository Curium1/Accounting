import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // Your backend API server
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''), // Rewrite /api to /
      },
    },
  },
  resolve: {
    alias: {
      // tells Vite that `@/xxx` → `<projectRoot>/src/xxx`
      '@': path.resolve(__dirname, 'src')
    }
  }
})
