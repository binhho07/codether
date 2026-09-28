import { z } from 'zod';

export const CheckStatusSchema = z.enum(['ok', 'fail']);
export type CheckStatus = z.infer<typeof CheckStatusSchema>;

/** Response body of `GET /api/health` (liveness) and `GET /api/health/ready` (readiness). */
export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  uptimeSeconds: z.number().nonnegative(),
  checks: z.record(z.string(), CheckStatusSchema),
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
