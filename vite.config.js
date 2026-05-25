import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Isolate three.js into its own chunk — only loaded by BallPit
          if (id.includes('node_modules/three')) {
            return 'three';
          }
          // Separate React/React-DOM from app code
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
            return 'react';
          }
          // Router in its own chunk
          if (id.includes('node_modules/react-router')) {
            return 'router';
          }
        },
      },
    },
    // Inline small assets to reduce HTTP requests
    assetsInlineLimit: 4096,
  },
})
