import fs from 'fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { appConfig } from './src/config/appConfig';
import fplWorker from './worker/src/index';

const fplSeasonAssetsDir = path.resolve(
  __dirname,
  'data',
  'competitions',
  'fpl',
  'seasons',
  appConfig.activeSeason,
  'assets'
);

function fplSeasonAssetsPlugin(): Plugin {
  const resolveAssetPath = (requestUrl?: string): string | null => {
    const pathname = decodeURIComponent((requestUrl ?? '').split('?')[0]);
    let relativePath: string | null = null;

    if (pathname === '/player-photo-placeholder.svg') {
      relativePath = 'player-photo-placeholder.svg';
    } else if (pathname.startsWith('/player-photos/')) {
      relativePath = pathname.slice(1);
    }

    if (!relativePath || relativePath.includes('..')) {
      return null;
    }

    const assetPath = path.resolve(fplSeasonAssetsDir, relativePath);
    const relativeToAssets = path.relative(fplSeasonAssetsDir, assetPath);
    if (relativeToAssets.startsWith('..') || path.isAbsolute(relativeToAssets)) {
      return null;
    }

    return assetPath;
  };

  return {
    name: 'fpl-season-assets',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const assetPath = resolveAssetPath(req.url);
        if (!assetPath || !fs.existsSync(assetPath) || !fs.statSync(assetPath).isFile()) {
          next();
          return;
        }

        res.setHeader(
          'Content-Type',
          path.extname(assetPath).toLowerCase() === '.svg' ? 'image/svg+xml' : 'image/png'
        );
        res.setHeader('Cache-Control', 'public, max-age=3600');
        fs.createReadStream(assetPath).pipe(res);
      });
    },
    writeBundle(options) {
      if (!options.dir || !fs.existsSync(fplSeasonAssetsDir)) {
        return;
      }

      fs.cpSync(fplSeasonAssetsDir, options.dir, { recursive: true });
    },
  };
}

function fplDevelopmentApiPlugin(): Plugin {
  return {
    name: 'fpl-development-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const requestPath = req.url?.split('?')[0] ?? '';
        if (!requestPath.startsWith('/api/fpl')) {
          next();
          return;
        }

        try {
          const requestUrl = new URL(req.url ?? '/api/fpl/status', 'http://localhost:5173');
          const response = await fplWorker.fetch(
            new Request(requestUrl, { method: req.method ?? 'GET' }),
            { ALLOWED_ORIGIN: 'http://localhost:5173' }
          );

          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch (error) {
          server.config.logger.error(
            `Local FPL API failed: ${error instanceof Error ? error.message : String(error)}`
          );
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(
            JSON.stringify({
              data: null,
              dataStatus: 'ERROR',
              lastUpdated: new Date().toISOString(),
              error: 'Local FPL API is temporarily unavailable.',
            })
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), fplSeasonAssetsPlugin(), fplDevelopmentApiPlugin()],
  // Keep competition branding in /public. FPL player photos remain owned by the
  // active season data directory and are exposed by fplSeasonAssetsPlugin.
  publicDir: path.resolve(__dirname, 'public'),
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
    strictPort: true,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    target: 'ES2023',
    minify: 'terser',
  },
});
