// Lokálne error tracking: chyby z prehliadača idú na vlastný /api/log endpoint
// (žiadny externý egress — Sentry a pod. až neskôr cez env-konfigurovateľný DSN).
export type ErrorLevel = 'error' | 'warn';

export function reportClientError(message: string, level: ErrorLevel = 'error', url?: string): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = JSON.stringify({
      level,
      message: String(message).slice(0, 500),
      url: (url ?? window.location.href).slice(0, 300),
      userAgent: window.navigator.userAgent.slice(0, 200),
      ts: new Date().toISOString(),
    });
    void fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // reporting nesmie nikdy spadnúť aplikáciu
  }
}

export function initErrorReporting(): void {
  if (typeof window === 'undefined') return;
  window.addEventListener('error', (e) => {
    reportClientError(e.message || 'Unknown error');
  });
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason;
    const message = reason instanceof Error ? reason.message : String(reason);
    reportClientError(message || 'Unhandled promise rejection');
  });
}
