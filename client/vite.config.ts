import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        ws: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  cors: true,
  plugins: [svelte()],
  resolve: {
    alias: {
      '@engine': fileURLToPath(new URL('../engine', import.meta.url))
    }
  }
});
