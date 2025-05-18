import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to your Express API server
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
    },
  },
  // Ensure TypeScript types are properly resolved
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
