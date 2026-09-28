import type { AddressInfo } from 'node:net';
import type http from 'node:http';
import { HealthResponseSchema } from '@codether/shared';
import { pino } from 'pino';
import { afterEach, describe, expect, it } from 'vitest';
import { createHttpServer } from './server.ts';

let server: http.Server | undefined;

async function start(pistonOk: boolean): Promise<string> {
  server = createHttpServer({
    logger: pino({ level: 'silent' }),
    checkPiston: () => Promise.resolve(pistonOk),
  });
  const s = server;
  await new Promise<void>((resolve) => s.listen(0, '127.0.0.1', resolve));
  const { port } = s.address() as AddressInfo;
  return `http://127.0.0.1:${port}`;
}

afterEach(async () => {
  const s = server;
  if (s) await new Promise((resolve) => s.close(resolve));
  server = undefined;
});

describe('collab HTTP server', () => {
  it('GET /api/health reports liveness', async () => {
    const base = await start(false);
    const res = await fetch(`${base}/api/health`);
    expect(res.status).toBe(200);
    expect(HealthResponseSchema.parse(await res.json()).status).toBe('ok');
  });

  it('GET /api/health/ready is 200 when Piston is reachable', async () => {
    const base = await start(true);
    const res = await fetch(`${base}/api/health/ready`);
    expect(res.status).toBe(200);
    expect(HealthResponseSchema.parse(await res.json()).checks).toEqual({ piston: 'ok' });
  });

  it('GET /api/health/ready is 503 when Piston is down', async () => {
    const base = await start(false);
    const res = await fetch(`${base}/api/health/ready`);
    expect(res.status).toBe(503);
    expect(HealthResponseSchema.parse(await res.json()).status).toBe('degraded');
  });

  it('unknown routes return 404', async () => {
    const base = await start(true);
    expect((await fetch(`${base}/nope`)).status).toBe(404);
  });
});
