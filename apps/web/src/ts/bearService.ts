import type { Bear } from './models.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readApiError(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const body = (await response.json()) as unknown;
    if (isRecord(body) && typeof body.error === 'string') {
      return body.error;
    }
  } catch {
    // Ignorieren, falls kein JSON-Fehlerkörper vorhanden ist
  }
  return `${fallback} (HTTP ${response.status})`;
}

export async function loadBears(signal?: AbortSignal): Promise<Bear[]> {
  const response = await fetch('/api/bears', { signal });

  if (!response.ok) {
    const message = await readApiError(response, 'Failed to load bears');
    throw new Error(message);
  }

  return (await response.json()) as Bear[];
}

export async function loadBearById(
  id: string,
  signal?: AbortSignal
): Promise<Bear> {
  const response = await fetch(`/api/bears/${encodeURIComponent(id)}`, {
    signal,
  });

  if (!response.ok) {
    const message = await readApiError(response, 'Failed to load bear details');
    throw new Error(message);
  }

  return (await response.json()) as Bear;
}
