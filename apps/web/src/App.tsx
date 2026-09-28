import { useEffect, useState } from 'react';
import { HealthResponseSchema, type HealthResponse } from '@codether/shared';

type HealthState =
  { kind: 'loading' } | { kind: 'ok'; health: HealthResponse } | { kind: 'unreachable' };

async function fetchReadiness(): Promise<HealthState> {
  try {
    // 503 still carries a valid body (degraded), so don't treat it as a failure.
    const res = await fetch('/api/health/ready');
    const parsed = HealthResponseSchema.safeParse(await res.json());
    return parsed.success ? { kind: 'ok', health: parsed.data } : { kind: 'unreachable' };
  } catch {
    return { kind: 'unreachable' };
  }
}

function StatusRow({ label, ok }: { label: string; ok: boolean | undefined }) {
  const color = ok === undefined ? 'bg-zinc-500' : ok ? 'bg-emerald-500' : 'bg-red-500';
  const text = ok === undefined ? 'checking…' : ok ? 'ok' : 'unreachable';
  return (
    <li className="flex items-center justify-between gap-6 py-1">
      <span className="text-zinc-300">{label}</span>
      <span className="flex items-center gap-2 text-sm text-zinc-400">
        <span className={`h-2 w-2 rounded-full ${color}`} />
        {text}
      </span>
    </li>
  );
}

export function App() {
  const [state, setState] = useState<HealthState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const next = await fetchReadiness();
      if (!cancelled) setState(next);
    };
    void poll();
    const id = setInterval(() => void poll(), 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const collabOk = state.kind === 'loading' ? undefined : state.kind === 'ok';
  const pistonOk =
    state.kind === 'loading'
      ? undefined
      : state.kind === 'ok' && state.health.checks.piston === 'ok';

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-8 px-6">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">codether</h1>
        <p className="mt-2 text-zinc-400">
          Write and run code together, in real time. Built for study groups and tutoring.
        </p>
      </div>
      <section className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h2 className="mb-2 text-sm font-medium uppercase tracking-wide text-zinc-500">
          System status
        </h2>
        <ul>
          <StatusRow label="Collab server" ok={collabOk} />
          <StatusRow label="Code runner (Piston)" ok={pistonOk} />
        </ul>
      </section>
    </main>
  );
}
