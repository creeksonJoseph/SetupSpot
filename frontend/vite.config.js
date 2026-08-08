import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting — keeps vendor libs in stable, long-lived
         * cached chunks separate from page code. When only app code changes,
         * the browser re-downloads only the tiny changed page chunks — not the
         * entire vendor bundle.
         *
         * Chunks:
         *  react-vendor  — React + ReactDOM (largest, changes least)
         *  router        — react-router-dom
         *  motion        — Framer Motion / motion library
         *  algolia       — Algolia search client
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            if (id.includes('motion') || id.includes('framer')) {
              return 'motion';
            }
            if (id.includes('algoliasearch') || id.includes('@algolia')) {
              return 'algolia';
            }
            // All other node_modules → shared vendor chunk
            return 'vendor';
          }
        },
      },
    },
  },
})
