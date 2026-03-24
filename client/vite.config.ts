import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Vite config for Google Apps Script deployment.
// vite-plugin-singlefile bundles JS + CSS inline into index.html,
// which is then pushed to GAS by clasp as a HtmlService template.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: '../gas',       // output directly into the gas/ folder
    emptyOutDir: false,     // don't wipe the .ts files in gas/
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    // Prevent asset size warnings for the bundled file
    chunkSizeWarningLimit: 5000,
  },
})
