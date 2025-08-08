import { defineConfig } from 'vite';
import path from 'path';
import generateEntrypoints from './generate.js';
const isBuild = process.env.BUILD === 'true';
generateEntrypoints({ isBuild });

const buildConfig = () => ({
  rollupOptions: { input: path.resolve(__dirname, '.vite/main.js'), output: { format: 'iife', entryFileNames: 'vendor.js', assetFileNames: 'vendor.css', name: 'VendorBundle' } },
  cssCodeSplit: false,
  outDir: 'vendor',
  minify: 'terser',
  emptyOutDir: true
});

export default defineConfig({
  root: '.',
  build: isBuild ? buildConfig() : undefined,
  server: {
    watch: {
      async onRebuild() {
        console.log('📦 vendor.config.json changed. Regenerating...');
        generateEntrypoints(false);
      }
    }
  }
});
