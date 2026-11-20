// Anonymné metriky používania — iba event name + sanitizované props, same-origin.
export function trackEvent(event: string, props?: Record<string, string | number | boolean>): void {
  if (typeof window === 'undefined') return;
  try {
    void fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, props: props ?? {} }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // metriky nesmú nikdy spadnúť aplikáciu
  }
}
