import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
    rollupOptions: {
      external: ['@mui/icons-material']
    }
  }
});
