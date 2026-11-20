// Anonymné metriky — privacy-first sanitizácia.
// Povolené sú iba: čísla, booleany, a stringy z bezpečných kľúčov (enum hodnoty).
// Zakázané kľúče (idea, text, message, title, prompt, instruction, email, name...)
// sa vždy zahodia — do metriky sa nikdy nedostane voľný text používateľa.

export const METRIC_EVENTS = [
  'app_open',
  'generate_started',
  'generate_success',
  'generate_failed',
  'refine_started',
  'refine_success',
  'refine_failed',
  'export_opened',
  'history_opened',
  'locale_changed',
  'theme_changed',
  'pwa_install_clicked',
] as const;

export type MetricEvent = (typeof METRIC_EVENTS)[number];

const SAFE_STRING_KEYS = new Set(['tabKey', 'locale', 'theme', 'outcome']);
const FORBIDDEN_KEY_PATTERN =
  /idea|text|message|title|prompt|instruction|email|name|phone|url|content|body/i;
const SAFE_KEY_PATTERN = /^[a-zA-Z0-9_]+$/;
const MAX_PROPS = 5;
const MAX_STRING_LENGTH = 40;

export function isMetricEvent(value: unknown): value is MetricEvent {
  return typeof value === 'string' && (METRIC_EVENTS as readonly string[]).includes(value);
}

export function sanitizeMetricProps(raw: unknown): Record<string, number | boolean | string> {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return {};
  const out: Record<string, number | boolean | string> = {};
  let count = 0;
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (count >= MAX_PROPS) break;
    if (!SAFE_KEY_PATTERN.test(key) || FORBIDDEN_KEY_PATTERN.test(key)) continue;
    if (typeof value === 'number' && Number.isFinite(value)) {
      out[key] = value;
      count++;
    } else if (typeof value === 'boolean') {
      out[key] = value;
      count++;
    } else if (typeof value === 'string' && SAFE_STRING_KEYS.has(key) && value.length <= MAX_STRING_LENGTH) {
      out[key] = value;
      count++;
    }
  }
  return out;
}
