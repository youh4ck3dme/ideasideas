import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import type { GoogleGenAI } from '@google/genai';
import { createApiApp } from '../../server/aiArchitect.ts';
import { SAMPLE_PROJECT } from '../../src/data/sampleProjects.ts';

// Mock Gemini klienta — testuje kompletný serverový pipeline (parse JSON ->
// schema validácia -> HTTP 200) bez reálneho egressu na AI providera.
function createMockAiClient(): GoogleGenAI {
  return {
    models: {
      generateContent: async (params: { contents?: unknown }) => {
        const prompt = String(params?.contents ?? '');
        const sectionMatch = prompt.match(/sekciu "(\w+)"/);
        if (sectionMatch) {
          const key = sectionMatch[1] as keyof typeof SAMPLE_PROJECT.blueprint;
          return { text: JSON.stringify(SAMPLE_PROJECT.blueprint[key]) };
        }
        return { text: '```json\n' + JSON.stringify(SAMPLE_PROJECT.blueprint) + '\n```' };
      },
    },
  } as unknown as GoogleGenAI;
}

interface TestServer {
  server: Server;
  baseUrl: string;
}

async function startApiApp(options: Parameters<typeof createApiApp>[0]): Promise<TestServer> {
  const app = createApiApp(options);
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;
  return { server, baseUrl: `http://127.0.0.1:${port}` };
}

async function stopApiApp({ server }: TestServer): Promise<void> {
  server.close();
  await once(server, 'close');
}

const validGenerateBody = {
  idea: 'Aplikácia na sledovanie výdavkov pre študentov',
  targetAudience: 'študenti VŠ',
  budget: 'Nízky',
  projectType: 'Mobilná appka',
};

test('GET /api/health vracia ok a hasKey podľa AI klienta', async () => {
  const withKey = await startApiApp({ aiClientFactory: () => createMockAiClient(), rateLimit: false });
  try {
    const res = await fetch(`${withKey.baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.hasKey, true);
    assert.equal(body.provider, 'gemini');
  } finally {
    await stopApiApp(withKey);
  }

  const withoutKey = await startApiApp({ aiClientFactory: () => null, rateLimit: false });
  try {
    const res = await fetch(`${withoutKey.baseUrl}/api/health`);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.equal(body.hasKey, false);
    assert.equal(body.provider, 'none');
  } finally {
    await stopApiApp(withoutKey);
  }
});

test('bezpečnostné hlavičky sú na každej odpovedi (CSP zapnuté cez FORCE_CSP)', async () => {
  process.env.FORCE_CSP = '1';
  try {
    const { server, baseUrl } = await startApiApp({ aiClientFactory: () => createMockAiClient(), rateLimit: false });
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(res.headers.get('x-frame-options'), 'SAMEORIGIN');
      assert.equal(res.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
      const csp = res.headers.get('content-security-policy') ?? '';
      assert.match(csp, /default-src 'self'/);
      assert.match(csp, /frame-ancestors 'none'/);
    } finally {
      await stopApiApp({ server, baseUrl });
    }
  } finally {
    delete process.env.FORCE_CSP;
  }
});

test('cross-origin POST na /api je zamietnutý (403)', async () => {
  const ctx = await startApiApp({ aiClientFactory: () => createMockAiClient(), rateLimit: false });
  try {
    const res = await fetch(`${ctx.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://evil.example.com',
      },
      body: JSON.stringify(validGenerateBody),
    });
    assert.equal(res.status, 403);
  } finally {
    await stopApiApp(ctx);
  }
});

test('POST /api/generate bez AI kľúča vracia 503', async () => {
  const ctx = await startApiApp({ aiClientFactory: () => null, rateLimit: false });
  try {
    const res = await fetch(`${ctx.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validGenerateBody),
    });
    assert.equal(res.status, 503);
    const body = await res.json();
    assert.match(body.error, /API kľúč/);
  } finally {
    await stopApiApp(ctx);
  }
});

test('POST /api/generate odmietne nevalidný vstup (400)', async () => {
  const ctx = await startApiApp({ aiClientFactory: () => createMockAiClient(), rateLimit: false });
  try {
    const cases: unknown[] = [
      { ...validGenerateBody, idea: 'krátke' },
      { ...validGenerateBody, idea: 'a'.repeat(2501) },
      { ...validGenerateBody, budget: 'milión' },
      { ...validGenerateBody, projectType: 'Casino' },
      {},
      null,
    ];
    for (const payload of cases) {
      const res = await fetch(`${ctx.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      assert.equal(res.status, 400, `payload: ${JSON.stringify(payload)?.slice(0, 60)}`);
      // Express pri non-strict JSON (napr. null) môže vrátiť 400 aj ako HTML — dôležitý je status
      if ((res.headers.get('content-type') ?? '').includes('application/json')) {
        const body = await res.json();
        assert.ok(typeof body.error === 'string' && body.error.length > 0);
      }
    }
  } finally {
    await stopApiApp(ctx);
  }
});

test('POST /api/generate s mock AI klientom vráti validovaný blueprint (funkčné AI end-to-end na serveri)', async () => {
  const ctx = await startApiApp({ aiClientFactory: () => createMockAiClient(), rateLimit: false });
  try {
    const res = await fetch(`${ctx.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validGenerateBody),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.ok(body.blueprint, 'blueprint v odpovedi');
    assert.equal(body.blueprint.promo.projectName, SAMPLE_PROJECT.blueprint.promo.projectName);
    assert.equal(body.blueprint.roadmap.phases.length, 3);
    assert.equal(body.blueprint.antifail.fatalMistakes.length, 5);
  } finally {
    await stopApiApp(ctx);
  }
});

test('POST /api/refine s mock AI vráti upravenú sekciu', async () => {
  const ctx = await startApiApp({ aiClientFactory: () => createMockAiClient(), rateLimit: false });
  try {
    const res = await fetch(`${ctx.baseUrl}/api/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tabKey: 'roadmap',
        instruction: 'Rozdeľ MVP na menšie týždňové kroky',
        project: SAMPLE_PROJECT,
      }),
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.tabKey, 'roadmap');
    assert.ok(body.sectionData.phases, 'sectionData má phases');
  } finally {
    await stopApiApp(ctx);
  }
});

test('POST /api/refine odmietne neplatnú sekciu alebo projekt (400)', async () => {
  const ctx = await startApiApp({ aiClientFactory: () => createMockAiClient(), rateLimit: false });
  try {
    const res = await fetch(`${ctx.baseUrl}/api/refine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tabKey: 'admin', instruction: 'zmaž všetko', project: SAMPLE_PROJECT }),
    });
    assert.equal(res.status, 400);
  } finally {
    await stopApiApp(ctx);
  }
});

test('rate limit na /api/generate: po limite nasleduje 429 s Retry-After', async () => {
  const ctx = await startApiApp({
    aiClientFactory: () => createMockAiClient(),
    rateLimit: { generate: 2, refine: 100, windowMs: 60_000 },
  });
  try {
    const ip = '10.77.0.1';
    const headers = {
      'Content-Type': 'application/json',
      'X-Forwarded-For': ip,
    };
    const r1 = await fetch(`${ctx.baseUrl}/api/generate`, { method: 'POST', headers, body: JSON.stringify(validGenerateBody) });
    const r2 = await fetch(`${ctx.baseUrl}/api/generate`, { method: 'POST', headers, body: JSON.stringify(validGenerateBody) });
    const r3 = await fetch(`${ctx.baseUrl}/api/generate`, { method: 'POST', headers, body: JSON.stringify(validGenerateBody) });
    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200);
    assert.equal(r3.status, 429);
    assert.ok(r3.headers.get('retry-after'), 'Retry-After header');
    assert.equal(r3.headers.get('x-ratelimit-limit'), '2');
    const body = await r3.json();
    assert.match(body.error, /Príliš veľa požiadaviek/);
  } finally {
    await stopApiApp(ctx);
  }
});

test('POST /api/log prijme validnú chybu (200) a odmietne prázdnu (400)', async () => {
  const ctx = await startApiApp({ aiClientFactory: () => createMockAiClient(), rateLimit: false });
  try {
    const ok = await fetch(`${ctx.baseUrl}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'error', message: 'Testovacia chyba z klienta', url: 'http://127.0.0.1/' }),
    });
    assert.equal(ok.status, 200);
    assert.deepEqual(await ok.json(), { ok: true });

    const bad = await fetch(`${ctx.baseUrl}/api/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level: 'error', message: '' }),
    });
    assert.equal(bad.status, 400);
  } finally {
    await stopApiApp(ctx);
  }
});

test('POST /api/log má rate limit (429 po limite)', async () => {
  const ctx = await startApiApp({
    aiClientFactory: () => createMockAiClient(),
    rateLimit: { generate: 100, refine: 100, log: 2, windowMs: 60_000 },
  });
  try {
    const headers = { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.88.0.1' };
    const body = JSON.stringify({ level: 'warn', message: 'x' });
    const r1 = await fetch(`${ctx.baseUrl}/api/log`, { method: 'POST', headers, body });
    const r2 = await fetch(`${ctx.baseUrl}/api/log`, { method: 'POST', headers, body });
    const r3 = await fetch(`${ctx.baseUrl}/api/log`, { method: 'POST', headers, body });
    assert.equal(r1.status, 200);
    assert.equal(r2.status, 200);
    assert.equal(r3.status, 429);
  } finally {
    await stopApiApp(ctx);
  }
});

test('POST /api/metrics: validný event 200, neznámy 400, nad limit 429', async () => {
  const ctx = await startApiApp({
    aiClientFactory: () => createMockAiClient(),
    rateLimit: { generate: 100, refine: 100, metrics: 3, windowMs: 60_000 },
  });
  try {
    const headers = { 'Content-Type': 'application/json', 'X-Forwarded-For': '10.89.0.1' };
    const ok = await fetch(`${ctx.baseUrl}/api/metrics`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ event: 'generate_success', props: { durationMs: 1200, tabKey: 'promo' } }),
    });
    assert.equal(ok.status, 200);

    const bad = await fetch(`${ctx.baseUrl}/api/metrics`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ event: 'nieco_zle', props: {} }),
    });
    assert.equal(bad.status, 400);

    // pozn.: aj 400 odpoveď ráta do rate limitu (kontrola prebieha pred validáciou)
    const r2 = await fetch(`${ctx.baseUrl}/api/metrics`, { method: 'POST', headers, body: JSON.stringify({ event: 'app_open' }) });
    const r3 = await fetch(`${ctx.baseUrl}/api/metrics`, { method: 'POST', headers, body: JSON.stringify({ event: 'app_open' }) });
    assert.equal(r2.status, 200);
    assert.equal(r3.status, 429);
  } finally {
    await stopApiApp(ctx);
  }
});
