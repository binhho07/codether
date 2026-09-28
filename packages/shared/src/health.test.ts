import { describe, expect, it } from 'vitest';
import { HealthResponseSchema } from './health.ts';

describe('HealthResponseSchema', () => {
  it('accepts a valid readiness payload', () => {
    const parsed = HealthResponseSchema.parse({
      status: 'degraded',
      uptimeSeconds: 12.5,
      checks: { piston: 'fail' },
    });
    expect(parsed.checks.piston).toBe('fail');
  });

  it('rejects unknown statuses', () => {
    expect(
      HealthResponseSchema.safeParse({ status: 'meh', uptimeSeconds: 1, checks: {} }).success,
    ).toBe(false);
  });
});
