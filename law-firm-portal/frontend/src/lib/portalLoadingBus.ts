/** Global in-flight counter for portal network / async work (matches website full-screen spinner UX). */

let activeRequests = 0;
const listeners = new Set<() => void>();

function emit(): void {
  for (const l of listeners) l();
}

/** React `useSyncExternalStore` subscription. */
export function subscribePortalLoading(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPortalActiveRequestCount(): number {
  return activeRequests;
}

export function beginPortalLoading(): void {
  activeRequests += 1;
  emit();
}

export function endPortalLoading(): void {
  activeRequests = Math.max(0, activeRequests - 1);
  emit();
}

export async function withPortalLoading<T>(fn: () => Promise<T>): Promise<T> {
  beginPortalLoading();
  try {
    return await fn();
  } finally {
    endPortalLoading();
  }
}
