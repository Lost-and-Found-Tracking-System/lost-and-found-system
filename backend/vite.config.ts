import { defineConfig } from 'vite'

// Vite is used in SSR/library mode to bundle the Express server.
export default defineConfig({
  build: {
    ssr: 'src/server.ts',
    target: 'node18',
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: 'server.mjs',
        format: 'es',
      },
    },
  },
})
