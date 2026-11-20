import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (rel: string) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

test('PWA/iOS: status bar black-translucent, bez auto-linkovania telefónov, splash screeny', () => {
  const html = read('index.html');
  assert.match(html, /apple-mobile-web-app-status-bar-style" content="black-translucent"/, 'black-translucent');
  assert.match(html, /name="format-detection" content="telephone=no"/, 'format-detection');
  const splashLinks = html.match(/rel="apple-touch-startup-image"[^>]*href="([^"]+)"/g) ?? [];
  assert.ok(splashLinks.length >= 9, `aspoň 9 splash linkov (je ${splashLinks.length})`);
  const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  for (const link of splashLinks) {
    const href = link.match(/href="([^"]+)"/)![1];
    const file = path.join(repoRoot, 'public', href.replace(/^\//, ''));
    assert.ok(fs.existsSync(file), `splash súbor existuje: ${href}`);
    const head = fs.readFileSync(file).subarray(0, 8);
    assert.ok(head.equals(pngMagic), `platné PNG: ${href}`);
  }
});

test('PWA: SW autoUpdate + kontrola novej verzie a update toast', () => {
  const main = read('src/main.tsx');
  assert.match(main, /registerSW\(/, 'registerSW volané');
  assert.match(main, /registration\.update\(\)/, 'periodická kontrola novej verzie SW');
  const toast = read('src/components/SWUpdateToast.tsx');
  assert.match(toast, /controllerchange/, 'toast reaguje na controllerchange');
  assert.match(toast, /Obnoviť/, 'toast má akciu Obnoviť');
  const app = read('src/App.tsx');
  assert.match(app, /<SWUpdateToast \/>/, 'SWUpdateToast zapojený v App');
});

test('a11y: prefers-reduced-motion v oboch CSS + focus-visible štýly', () => {
  for (const file of ['src/index.css', 'app/globals.css']) {
    const css = read(file);
    assert.match(css, /@media \(prefers-reduced-motion: reduce\)/, `${file}: reduced-motion media`);
    assert.match(css, /animation-duration:\s*0\.01ms\s*!important/, `${file}: animácie vypnuté`);
    assert.match(css, /transition-duration:\s*0\.01ms\s*!important/, `${file}: transitiony vypnuté`);
    assert.match(css, /scroll-behavior:\s*auto\s*!important/, `${file}: scroll-behavior auto`);
    assert.match(css, /button:focus-visible/, `${file}: focus-visible pre buttony`);
  }
});

test('a11y: smooth scroll sa riadi cez scrollBehavior() helper (nie natvrdo)', () => {
  assert.ok(fs.existsSync(path.join(repoRoot, 'src/utils/motion.ts')), 'motion util existuje');
  for (const file of ['src/components/IdeaCaptureScreen.tsx', 'src/components/RefineBar.tsx']) {
    const src = read(file);
    assert.ok(!src.includes("behavior: 'smooth'"), `${file}: žiadny natvrdo smooth`);
    assert.match(src, /behavior:\s*scrollBehavior\(\)/, `${file}: používa scrollBehavior()`);
  }
});

test('a11y: Escape zavrie drawer/modály', () => {
  for (const file of [
    'src/components/HistoryDrawer.tsx',
    'src/components/ExportModal.tsx',
    'src/components/PWAInstallChip.tsx',
  ]) {
    const src = read(file);
    assert.match(src, /e\.key === 'Escape'/, `${file}: Escape handler`);
  }
});

test('a11y: kontrast použitých kombinácií (WCAG AA pre text) — dokumentačný test', () => {
  // Hlavné kombinácie: #52525B/#FAFAFA (~7:1), #71717A/#FAFAFA (~4.6:1), #A1A1AA/#09090B (~7:1)
  // Všetky spĺňajú AA (≥ 4.5:1) pre bežný text — výnimka WCAG 1.4.4 (zakázaný zoom)
  // je zdokumentovaná v docs/NATIVE_APP_FEEL_DIAGNOSTIKA_A_BACKLOG.md (PWA standalone).
  const doc = read('docs/NATIVE_APP_FEEL_DIAGNOSTIKA_A_BACKLOG.md');
  assert.match(doc, /WCAG 1\.4\.4/, 'WCAG 1.4.4 výnimka je zdokumentovaná');
});
