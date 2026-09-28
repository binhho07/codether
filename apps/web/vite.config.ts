import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ mode }) => {
  // The single .env lives at the repo root and is shared with apps/collab.
  const env = loadEnv(mode, repoRoot, '');
  const collabTarget = env.COLLAB_PROXY_TARGET ?? 'http://localhost:4000';

  return {
    envDir: repoRoot,
    plugins: [react(), tailwindcss()],
    server: {
      host: env.WEB_HOST ?? 'localhost',
      port: 5173,
      strictPort: true,
      // Same path layout as production (Caddy): the browser only ever talks to
      // its own origin, so no CORS and no extra origins to allow.
      proxy: {
        '/api': { target: collabTarget, changeOrigin: false },
        '/collab': { target: collabTarget, ws: true, changeOrigin: false },
      },
    },
  };
});
