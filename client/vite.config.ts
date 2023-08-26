import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://10.0.0.237:8080',
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
