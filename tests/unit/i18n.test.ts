import test from 'node:test';
import assert from 'node:assert/strict';
import { translations, translate, type Locale } from '../../src/i18n/index.tsx';

test('i18n: SK a EN slovníky majú rovnaké kľúče (parita)', () => {
  const skKeys = Object.keys(translations.sk).sort();
  const enKeys = Object.keys(translations.en).sort();
  assert.deepEqual(enKeys, skKeys);
});

test('i18n: translate robí fallback na SK a interpoluje premenné', () => {
  assert.equal(translate('en', 'appbar.projects'), 'Projects');
  assert.equal(translate('sk', 'appbar.projects'), 'Projekty');
  assert.equal(translate('en', 'history.title', { count: 3 }), 'Saved projects (3)');
  assert.equal(translate('sk', 'history.title', { count: 5 }), 'Uložené projekty (5)');
  assert.equal(translate('en' as Locale, 'neexistujuci.kluc'), 'neexistujuci.kluc', 'fallback na kľúč');
  assert.equal(translate('en', 'appbar.export'), translations.en['appbar.export']);
});
