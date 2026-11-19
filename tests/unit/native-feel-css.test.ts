import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = (rel: string) => fs.readFileSync(path.join(repoRoot, rel), 'utf8');

const cssFiles = ['src/index.css', 'app/globals.css'];

test('native feel: globálny zákaz výberu textu a iOS callout (s výnimkou pre inputy)', () => {
  for (const file of cssFiles) {
    const css = read(file);
    assert.match(css, /-webkit-touch-callout:\s*none\s*!important/, `${file}: touch-callout none`);
    assert.match(css, /-webkit-user-select:\s*none\s*!important/, `${file}: user-select none`);
    assert.match(css, /user-select:\s*none\s*!important/, `${file}: user-select none`);
    assert.match(css, /input,[\s\S]*?textarea,[\s\S]*?\[contenteditable='true'\][\s\S]*?user-select:\s*text\s*!important/, `${file}: výnimka pre input/textarea`);
  }
});

test('native feel: zákaz tap-highlight a ťahania obrázkov', () => {
  for (const file of cssFiles) {
    const css = read(file);
    assert.match(css, /-webkit-tap-highlight-color:\s*transparent\s*!important/, `${file}: tap-highlight`);
    assert.match(css, /-webkit-user-drag:\s*none\s*!important/, `${file}: user-drag none`);
  }
});

test('native feel: spevnený viewport (dvh, overflow hidden, overscroll none, touch-action pan-y)', () => {
  for (const file of cssFiles) {
    const css = read(file);
    assert.match(css, /100dvh/, `${file}: 100dvh`);
    assert.match(css, /overflow:\s*hidden/, `${file}: overflow hidden`);
    assert.match(css, /overscroll-behavior:\s*none/, `${file}: overscroll none`);
    assert.match(css, /overscroll-behavior-y:\s*none/, `${file}: overscroll-y none`);
    assert.match(css, /touch-action:\s*pan-y/, `${file}: touch-action pan-y`);
  }
  const appScroll = read('src/index.css');
  assert.match(appScroll, /\.app-scroll-viewport\s*\{[\s\S]*?overscroll-behavior-y:\s*contain/, 'app-scroll-viewport: contain');
  assert.match(appScroll, /\.app-scroll-viewport\s*\{[\s\S]*?touch-action:\s*pan-y/, 'app-scroll-viewport: pan-y');
});

test('native feel: scrollbar skrytý na dotykových zariadeniach (pointer: coarse)', () => {
  for (const file of cssFiles) {
    const css = read(file);
    assert.match(css, /@media \(pointer: coarse\)\s*\{[\s\S]*?scrollbar-width:\s*none/, `${file}: coarse scrollbar-width none`);
    assert.match(css, /@media \(pointer: coarse\)\s*\{[\s\S]*?::-webkit-scrollbar\s*\{\s*display:\s*none/, `${file}: coarse webkit scrollbar hidden`);
  }
});

test('native feel: viewport meta zakazuje zoom a podporuje safe-areas', () => {
  const html = read('index.html');
  const viewport = html.match(/<meta name="viewport" content="([^"]+)"/);
  assert.ok(viewport, 'viewport meta existuje');
  assert.match(viewport[1], /maximum-scale=1\.0/, 'maximum-scale=1.0');
  assert.match(viewport[1], /user-scalable=no/, 'user-scalable=no');
  assert.match(viewport[1], /viewport-fit=cover/, 'viewport-fit=cover');
});

test('native feel: safe-area použité v hlavičke, navigácii, draweri a toaste', () => {
  const topAppBar = read('src/components/TopAppBar.tsx');
  assert.match(topAppBar, /max\(env\(safe-area-inset-top\),\s*12px\)/, 'TopAppBar top safe-area');
  const workspace = read('src/components/WorkspaceScreen.tsx');
  assert.match(workspace, /env\(safe-area-inset-bottom\)/, 'bottom nav safe-area');
  const drawer = read('src/components/HistoryDrawer.tsx');
  assert.match(drawer, /env\(safe-area-inset-top\)/, 'drawer safe-area');
  const toast = read('src/components/ErrorToast.tsx');
  assert.match(toast, /env\(safe-area-inset-bottom\)/, 'toast safe-area');
});
