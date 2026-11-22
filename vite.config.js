import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Dev-only: prints messages sent by src/utils/debugLog.js to this terminal.
function debugLogPlugin() {
  return {
    name: 'portfolio-debug-log',
    apply: 'serve',
    configureServer(server) {
      console.log('\x1b[36m[portfolio-debug]\x1b[0m debug logging enabled, browser events will print here');
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'POST' || !req.url?.endsWith('/__debug-log')) return next();
        let body = '';
        req.on('data', (chunk) => { body += chunk; });
        req.on('end', () => {
          try {
            const { t, event, ...rest } = JSON.parse(body);
            console.log(`\x1b[36m[portfolio-debug]\x1b[0m +${t}ms ${event}`, JSON.stringify(rest));
          } catch {
            console.log('[portfolio-debug]', body);
          }
          res.statusCode = 204;
          res.end();
        });
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), debugLogPlugin()],
    base: env.VITE_BASE_PATH || '/portfolio/',
  };
});
