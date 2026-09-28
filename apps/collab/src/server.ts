import http from 'node:http';
import type { HealthResponse } from '@codether/shared';
import type { Logger } from './logger.ts';

export interface ServerDeps {
  logger: Logger;
  checkPiston: () => Promise<boolean>;
  startedAt?: number;
}

function sendJson(res: http.ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload),
    'cache-control': 'no-store',
  });
  res.end(payload);
}

/**
 * Plain HTTP server for the `/api/*` routes. The Hocuspocus WebSocket endpoint
 * (`/collab`) will be attached to this same server via its `upgrade` event.
 */
export function createHttpServer({
  logger,
  checkPiston,
  startedAt = Date.now(),
}: ServerDeps): http.Server {
  const uptimeSeconds = (): number => (Date.now() - startedAt) / 1000;

  const handle = async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (req.method === 'GET' && url.pathname === '/api/health') {
      // Liveness: the process is up and serving requests. No dependency checks.
      const body: HealthResponse = { status: 'ok', uptimeSeconds: uptimeSeconds(), checks: {} };
      sendJson(res, 200, body);
      return;
    }

    if (req.method === 'GET' && url.pathname === '/api/health/ready') {
      // Readiness: can we actually execute code right now?
      const pistonOk = await checkPiston();
      const body: HealthResponse = {
        status: pistonOk ? 'ok' : 'degraded',
        uptimeSeconds: uptimeSeconds(),
        checks: { piston: pistonOk ? 'ok' : 'fail' },
      };
      sendJson(res, pistonOk ? 200 : 503, body);
      return;
    }

    sendJson(res, 404, { error: 'not_found' });
  };

  return http.createServer((req, res) => {
    handle(req, res).catch((err: unknown) => {
      logger.error({ err, url: req.url }, 'unhandled request error');
      if (!res.headersSent) sendJson(res, 500, { error: 'internal_error' });
      else res.destroy();
    });
  });
}
