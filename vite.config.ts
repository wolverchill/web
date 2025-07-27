import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    // Optimizaciones de build
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar librerías grandes en chunks
          'three': ['three'],
          'chart': ['chart.js', 'vue-chartjs'],
          'vendor': ['vue', 'vue-router', 'pinia'],
          'utils': ['axios', 'flubber']
        }
      }
    },
    // Optimizar CSS
    cssCodeSplit: true,
    // Optimizar assets
    assetsInlineLimit: 4096,
    // Compresión
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // Optimizaciones de desarrollo
  server: {
    hmr: {
      overlay: false
    }
  },
  // Optimizar dependencias
  optimizeDeps: {
    include: ['vue', 'vue-router', 'pinia', 'axios', 'three']
  }
})
