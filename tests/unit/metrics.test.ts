import test from 'node:test';
import assert from 'node:assert/strict';
import { isMetricEvent, sanitizeMetricProps, METRIC_EVENTS } from '../../lib/metrics.ts';

test('metrics: isMetricEvent prijíma iba allowlist eventy', () => {
  assert.ok(isMetricEvent('generate_success'));
  assert.ok(!isMetricEvent('generate_success_evil'));
  assert.ok(!isMetricEvent(''));
  assert.ok(!isMetricEvent(undefined));
  assert.ok(METRIC_EVENTS.length >= 10);
});

test('metrics: sanitizácia nechá čísla/booleany a bezpečné stringy (enum kľúče)', () => {
  const out = sanitizeMetricProps({
    durationMs: 1234,
    ok: true,
    tabKey: 'promo',
    locale: 'en',
    theme: 'dark',
  });
  assert.deepEqual(out, { durationMs: 1234, ok: true, tabKey: 'promo', locale: 'en', theme: 'dark' });
});

test('metrics: sanitizácia zahadzuje voľné texty a citlivé kľúče (privacy)', () => {
  const out = sanitizeMetricProps({
    idea: 'môj tajný nápad o trafike',
    instruction: 'prepíš všetko',
    message: 'chyba so stack trace',
    title: 'názov projektu',
    email: 'a@b.c',
    note: 'niečo tajné',
    freeText: 'hello world',
    durationMs: 42,
  });
  assert.deepEqual(out, { durationMs: 42 }, 'žiadny voľný text ani citlivý kľúč nesmie prejsť');
});

test('metrics: sanitizácia oreže počet props a dĺžku stringov, neplatné hodnoty zahodí', () => {
  const many: Record<string, number> = {};
  for (let i = 0; i < 10; i++) many[`k${i}`] = i;
  assert.equal(Object.keys(sanitizeMetricProps(many)).length, 5, 'max 5 props');

  const long = sanitizeMetricProps({ tabKey: 'x'.repeat(100) });
  assert.deepEqual(long, {}, 'príliš dlhý string sa zahodí');

  assert.deepEqual(sanitizeMetricProps(null), {});
  assert.deepEqual(sanitizeMetricProps('string'), {});
  assert.deepEqual(sanitizeMetricProps([1, 2]), {});
  assert.deepEqual(sanitizeMetricProps({ 'bad key!': 1, ok: 1 }), { ok: 1 }, 'neplatný názov kľúča sa zahodí');
  assert.deepEqual(sanitizeMetricProps({ n: NaN, inf: Infinity, ok: 1 }), { ok: 1 }, 'non-finite čísla von');
});
