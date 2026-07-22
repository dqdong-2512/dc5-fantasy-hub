import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@config': path.resolve(__dirname, './src/config'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@layouts': path.resolve(__dirname, './src/layouts'),
      '@theme': path.resolve(__dirname, './src/theme'),
      '@router': path.resolve(__dirname, './src/router'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@store': path.resolve(__dirname, './src/store'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@repositories': path.resolve(__dirname, './src/repositories'),
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/fpl': {
        target: 'https://fantasy.premierleague.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fpl/, '/api'),
        headers: {
          'User-Agent': 'DC5-Fantasy-Hub/1.0 (Development)',
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'ES2023',
    minify: 'terser',
  },
});
