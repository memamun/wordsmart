import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: { '/api': process.env.WORDSMART_API_PROXY_TARGET || 'http://127.0.0.1:5000' }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui': ['lucide-react', 'canvas-confetti']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
