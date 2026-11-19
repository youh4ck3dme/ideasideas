import test from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { SAMPLE_PROJECT } from '../../src/data/sampleProjects.ts';

// E2E testy na úrovni DOM (happy-dom): beží skutočný React strom celej aplikácie
// (App -> TopAppBar -> IdeaCaptureScreen/WorkspaceScreen -> drawer/modály),
// HTTP volania na /api/* sú mocknuté — AI pipeline je teda otestovaný end-to-end
// v UI bez reálneho egressu. Prehliadačové (Playwright) e2e patria do P2 backlogu.

interface Harness {
  window: any;
  container: any;
  root: any;
  act: (cb: () => Promise<void> | void) => Promise<void>;
  fetchCalls: string[];
}

async function createHarness(): Promise<Harness> {
  const window = new Window({ url: 'http://127.0.0.1:3000/' });
  const g = globalThis as Record<string, unknown>;
  const w = window as unknown as Record<string, unknown>;

  const defineGlobal = (key: string, value: unknown) => {
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
  };

  for (const key of [
    'document',
    'navigator',
    'localStorage',
    'HTMLElement',
    'HTMLTextAreaElement',
    'HTMLInputElement',
    'Element',
    'Node',
    'Event',
    'MouseEvent',
    'KeyboardEvent',
    'CustomEvent',
    'MutationObserver',
    'getComputedStyle',
    'requestAnimationFrame',
    'cancelAnimationFrame',
    'DocumentFragment',
    'SVGElement',
  ]) {
    if (w[key] !== undefined) defineGlobal(key, w[key]);
  }
  defineGlobal('window', window);
  if (typeof w.matchMedia !== 'function') {
    w.matchMedia = () => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    });
  }
  defineGlobal('matchMedia', w.matchMedia);
  if (typeof (window.Element.prototype as unknown as Record<string, unknown>).scrollIntoView !== 'function') {
    window.Element.prototype.scrollIntoView = () => {};
  }
  if (typeof w.ResizeObserver !== 'function') {
    w.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  defineGlobal('ResizeObserver', w.ResizeObserver);
  defineGlobal('IS_REACT_ACT_ENVIRONMENT', true);

  const fetchCalls: string[] = [];
  defineGlobal('fetch', async (input: unknown, init?: { body?: string }) => {
    const url = String(input);
    fetchCalls.push(url);
    if (url.includes('/api/generate')) {
      return new Response(JSON.stringify({ blueprint: SAMPLE_PROJECT.blueprint }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.includes('/api/refine')) {
      const body = JSON.parse(String(init?.body ?? '{}'));
      return new Response(
        JSON.stringify({ tabKey: body.tabKey, sectionData: SAMPLE_PROJECT.blueprint[body.tabKey as keyof typeof SAMPLE_PROJECT.blueprint] }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response('not found', { status: 404 });
  });

  const React = await import('react');
  const { createRoot } = await import('react-dom/client');
  const { default: App } = await import('../../src/App.tsx');

  const container = window.document.createElement('div');
  window.document.body.appendChild(container);
  const root = createRoot(container as unknown as HTMLElement);
  const act = React.act as (cb: () => Promise<void> | void) => Promise<void>;

  await act(async () => {
    root.render(React.createElement(App));
  });

  return { window, container, root, act, fetchCalls };
}

async function flush(harness: Harness, ms = 20): Promise<void> {
  await harness.act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });
}

function setInputValue(window: any, el: any, value: string): void {
  const proto = el instanceof window.HTMLTextAreaElement ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  setter?.call(el, value);
  el.dispatchEvent(new window.Event('input', { bubbles: true }));
}

function click(window: any, el: any): void {
  el.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
}

test('e2e: úvodná obrazovka sa zobrazí a prázdny submit zobrazí validačnú chybu', async () => {
  const h = await createHarness();
  try {
    assert.ok(h.container.querySelector('#idea-prompt-input'), 'textarea existuje');
    const form = h.container.querySelector('form')!;
    await h.act(async () => {
      form.dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
    });
    await flush(h);
    const alert = h.container.querySelector('[role="alert"]');
    assert.ok(alert, 'validačná chyba sa zobrazí');
    assert.match(alert.textContent ?? '', /nápad/i);
  } finally {
    await h.act(async () => h.root.unmount());
  }
});

test('e2e: kompletný generate flow — AI (mock) vráti blueprint a zobrazí sa workspace', async () => {
  const h = await createHarness();
  try {
    const textarea = h.container.querySelector('#idea-prompt-input')!;
    await h.act(async () => {
      setInputValue(h.window, textarea, 'Aplikácia na sledovanie výdavkov pre študentov');
    });
    const form = h.container.querySelector('form')!;
    await h.act(async () => {
      form.dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
    });
    await flush(h, 50);

    assert.ok(
      h.fetchCalls.some((u) => u.includes('/api/generate')),
      'volané /api/generate'
    );
    const tabs = h.container.querySelectorAll('[role="tab"]');
    assert.ok(tabs.length >= 5, 'zobrazia sa záložky workspace (navigácia)');
    assert.ok(
      (h.container.textContent ?? '').includes(SAMPLE_PROJECT.title),
      'zobrazí sa názov projektu'
    );
    assert.ok(
      h.container.querySelector('[aria-label^="Upraviť sekciu"]'),
      'zobrazí sa RefineBar'
    );
  } finally {
    await h.act(async () => h.root.unmount());
  }
});

test('e2e: prepínanie záložiek a refine flow cez mock /api/refine', async () => {
  const h = await createHarness();
  try {
    const textarea = h.container.querySelector('#idea-prompt-input')!;
    await h.act(async () => {
      setInputValue(h.window, textarea, 'Aplikácia na sledovanie výdavkov pre študentov');
      h.container.querySelector('form')!.dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
    });
    await flush(h, 50);

    const techTab = [...h.container.querySelectorAll('[role="tab"]')].find((t) =>
      (t.textContent ?? '').includes('Tech')
    )!;
    assert.ok(techTab, 'tab Tech existuje');
    await h.act(async () => click(h.window, techTab));
    await flush(h);
    const refineSection = h.container.querySelector('[aria-label^="Upraviť sekciu"]');
    assert.match(refineSection?.getAttribute('aria-label') ?? '', /Technický návrh/);

    const refineInput = refineSection!.querySelector('input[type="text"]')!;
    await h.act(async () => {
      setInputValue(h.window, refineInput, 'Prepracuj stack na no-code riešenie');
      refineSection!.querySelector('form')!.dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
    });
    await flush(h, 50);
    assert.ok(
      h.fetchCalls.some((u) => u.includes('/api/refine')),
      'volané /api/refine'
    );
  } finally {
    await h.act(async () => h.root.unmount());
  }
});

test('e2e: história projektov (drawer) a export modal fungujú', async () => {
  const h = await createHarness();
  try {
    const textarea = h.container.querySelector('#idea-prompt-input')!;
    await h.act(async () => {
      setInputValue(h.window, textarea, 'Aplikácia na sledovanie výdavkov pre študentov');
      h.container.querySelector('form')!.dispatchEvent(new h.window.Event('submit', { bubbles: true, cancelable: true }));
    });
    await flush(h, 50);

    const historyBtn = h.container.querySelector('button[aria-label^="Otvoriť históriu projektov"]')!;
    await h.act(async () => click(h.window, historyBtn));
    await flush(h);
    assert.match(h.container.textContent ?? '', /Uložené projekty/);

    const closeBtn = h.container.querySelector('button[aria-label="Zavrieť históriu projektov"]')!;
    await h.act(async () => click(h.window, closeBtn));
    await flush(h);

    const exportBtn = h.container.querySelector('button[aria-label="Exportovať projekt"]');
    assert.ok(exportBtn, 'tlačidlo Export existuje vo workspace');
    await h.act(async () => click(h.window, exportBtn!));
    await flush(h);
    const modalTitle = h.container.querySelector('#export-modal-title');
    assert.ok(modalTitle, 'export modal otvorený');
    const pre = h.container.querySelector('pre');
    assert.ok(pre && (pre.textContent ?? '').length > 100, 'markdown náhľad v modal');
  } finally {
    await h.act(async () => h.root.unmount());
  }
});

test('e2e: Escape zavrie history drawer', async () => {
  const h = await createHarness();
  try {
    const historyBtn = h.container.querySelector('button[aria-label^="Otvoriť históriu projektov"]')!;
    await h.act(async () => click(h.window, historyBtn));
    await flush(h);
    assert.match(h.container.textContent ?? '', /Uložené projekty/);
    await h.act(async () => {
      h.window.dispatchEvent(new h.window.KeyboardEvent('keydown', { key: 'Escape' }));
    });
    await flush(h);
    assert.ok(!/Uložené projekty/.test(h.container.textContent ?? ''), 'drawer sa zavrel po Escape');
  } finally {
    await h.act(async () => h.root.unmount());
  }
});

test('e2e: controllerchange zobrazí SW update toast', async () => {
  const h = await createHarness();
  try {
    assert.ok(!/nová verzia aplikácie/i.test(h.container.textContent ?? ''), 'toast predtým skrytý');
    await h.act(async () => {
      h.window.dispatchEvent(new h.window.Event('controllerchange'));
    });
    await flush(h);
    assert.match(h.container.textContent ?? '', /nová verzia aplikácie/i, 'toast sa zobrazil');
    const reloadBtn = [...h.container.querySelectorAll('button')].find((b: any) =>
      (b.textContent ?? '').includes('Obnoviť')
    );
    assert.ok(reloadBtn, 'tlačidlo Obnoviť existuje');
  } finally {
    await h.act(async () => h.root.unmount());
  }
});
