import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    host: '0.0.0.0',
    setupMiddlewares: (middlewares, server) => {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/favicon.ico') {
          res.statusCode = 204; // No Content
          return res.end();
        }
        next();
      });
      return middlewares;
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  resolve: {
    alias: {
      '@services': path.resolve(__dirname, './src/services')
    }
  }
});
