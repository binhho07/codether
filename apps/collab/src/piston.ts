/** Returns true if the Piston API answers within the timeout. Never throws. */
export async function isPistonReachable(pistonUrl: string, timeoutMs = 2000): Promise<boolean> {
  try {
    const res = await fetch(new URL('/api/v2/runtimes', pistonUrl), {
      signal: AbortSignal.timeout(timeoutMs),
    });
    return res.ok;
  } catch {
    return false;
  }
}
