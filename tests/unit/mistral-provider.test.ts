import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { createApiApp } from '../../server/aiArchitect.ts';
import { normalizeMistralKey } from '../../server/mistral.ts';
import { SAMPLE_PROJECT } from '../../src/data/sampleProjects.ts';

test('normalizeMistralKey ignoruje prázdny a placeholder kľúč', () => {
  assert.equal(normalizeMistralKey(undefined), null);
  assert.equal(normalizeMistralKey('  '), null);
  assert.equal(normalizeMistralKey('MY_MISTRAL_API_KEY'), null);
  assert.equal(normalizeMistralKey(' sk-test '), 'sk-test');
});

test('Mistral je hlavný provider a vráti blueprint bez Gemini schémy', async () => {
  let seenModel = '';
  const app = createApiApp({
    rateLimit: false,
    mistralApiKey: 'test-mistral-key',
    mistralFetch: async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model?: string; messages?: unknown[] };
      seenModel = body.model ?? '';
      const auth = new Headers(init?.headers).get('authorization') ?? '';
      assert.equal(auth, 'Bearer test-mistral-key');
      assert.ok(JSON.stringify(body.messages).includes('json') || JSON.stringify(body.messages).includes('JSON'));
      return new Response(
        JSON.stringify({
          choices: [{ message: { content: JSON.stringify(SAMPLE_PROJECT.blueprint) } }],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    },
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;
  try {
    const health = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.deepEqual(await health.json(), { ok: true, hasKey: true, provider: 'mistral' });

    const res = await fetch(`http://127.0.0.1:${port}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: 'Aplikácia na sledovanie výdavkov pre študentov',
        targetAudience: 'študenti VŠ',
        budget: 'Nízky',
        projectType: 'Mobilná appka',
      }),
    });
    assert.equal(res.status, 200);
    const payload = (await res.json()) as { blueprint?: { promo?: { projectName?: string } } };
    assert.equal(payload.blueprint?.promo?.projectName, SAMPLE_PROJECT.blueprint.promo.projectName);
    assert.equal(seenModel, 'mistral-large-latest');
  } finally {
    server.close();
    await once(server, 'close');
  }
});

test('Mistral 401 sa mapuje na 403 bez úniku tela odpovede do úspechu', async () => {
  const app = createApiApp({
    rateLimit: false,
    mistralApiKey: 'bad-key',
    mistralFetch: async () => new Response('{"message":"Unauthorized"}', { status: 401 }),
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;
  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: 'Aplikácia na sledovanie výdavkov pre študentov',
        targetAudience: 'študenti',
        budget: 'Nízky',
        projectType: 'SaaS',
      }),
    });
    assert.equal(res.status, 403);
    const body = (await res.json()) as { error?: string };
    assert.match(body.error ?? '', /zamietnutý/);
    assert.doesNotMatch(body.error ?? '', /bad-key/);
  } finally {
    server.close();
    await once(server, 'close');
  }
});
