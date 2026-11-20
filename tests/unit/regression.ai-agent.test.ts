import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import type { GoogleGenAI } from '@google/genai';
import { createApiApp } from '../../server/aiArchitect.ts';
import { SAMPLE_PROJECT } from '../../src/data/sampleProjects.ts';

// Regresná suita so "skriptovaným AI agentom": deterministický mock Gemini klienta
// vstreknutý cez DI šev createApiApp. Beží cez reálny HTTP server (loopback) a
// otestuje kompletný produkčný pipeline: prompt -> model -> parse -> schema
// validácia -> HTTP odpoveď, vrátane retry ciest (transient 503, zlý JSON).

type Behavior = 'ok' | 'transient503' | 'invalidThenValid' | 'alwaysInvalid';

interface ScriptedAgent {
  client: GoogleGenAI;
  calls: string[];
}

function createScriptedAgent(behavior: Behavior): ScriptedAgent {
  const calls: string[] = [];
  let callCount = 0;
  const client = {
    models: {
      generateContent: async (params: { contents?: unknown }) => {
        callCount += 1;
        const prompt = String(params?.contents ?? '');
        calls.push(prompt);
        const sectionMatch = prompt.match(/sekciu "(\w+)"/);
        const validPayload = sectionMatch
          ? JSON.stringify(SAMPLE_PROJECT.blueprint[sectionMatch[1] as keyof typeof SAMPLE_PROJECT.blueprint])
          : JSON.stringify(SAMPLE_PROJECT.blueprint);

        if (behavior === 'transient503' && callCount === 1) {
          const err = new Error('503 UNAVAILABLE') as Error & { status: number };
          err.status = 503;
          throw err;
        }
        if (behavior === 'invalidThenValid' && callCount === 1) {
          return { text: 'toto nie je json {{{' };
        }
        if (behavior === 'alwaysInvalid') {
          return { text: '{}' };
        }
        return { text: validPayload };
      },
    },
  } as unknown as GoogleGenAI;
  return { client, calls };
}

async function startApp(agent: ScriptedAgent) {
  const app = createApiApp({ aiClientFactory: () => agent.client, rateLimit: false });
  const server: Server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address() as AddressInfo;
  return {
    server,
    baseUrl: `http://127.0.0.1:${port}`,
    async stop() {
      server.close();
      await once(server, 'close');
    },
  };
}

const IDEA = 'Aplikácia na triedenie domáceho odpadu podľa lokality a kalendára zvozu';
const generateBody = {
  idea: IDEA,
  targetAudience: 'domácnosti na Slovensku',
  budget: 'Nízky',
  projectType: 'Mobilná appka',
};

async function postGenerate(baseUrl: string) {
  return fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(generateBody),
  });
}

test('regression: generate vráti kompletný blueprint so správnymi počtami sekcií', async () => {
  const agent = createScriptedAgent('ok');
  const ctx = await startApp(agent);
  try {
    const res = await postGenerate(ctx.baseUrl);
    assert.equal(res.status, 200);
    const { blueprint } = await res.json();

    assert.equal(blueprint.promo.promoPosts.length, 3, '3 promo príspevky');
    assert.equal(blueprint.promo.brandDirection.colors.length, 3, '3 značkové farby');
    assert.equal(blueprint.roadmap.phases.length, 3, '3 fázy');
    for (const phase of blueprint.roadmap.phases) {
      assert.ok(phase.items.length >= 3 && phase.items.length <= 6, `fáza ${phase.phaseNumber}: 3-6 úloh`);
    }
    assert.ok(Object.keys(blueprint.tech.stack).length === 5, 'tech stack má 5 častí');
    assert.ok(blueprint.marketing.pricingTiers.length >= 2 && blueprint.marketing.pricingTiers.length <= 3, '2-3 cenové balíky');
    assert.equal(blueprint.antifail.fatalMistakes.length, 5, '5 kritických chýb');
    assert.equal(blueprint.antifail.ironRules.length, 5, '5 železných pravidiel');
    assert.equal(blueprint.antifail.scalingPlaybook.length, 3, '3 etapy škálovania');

    assert.ok(agent.calls[0].includes(IDEA), 'prompt obsahuje zadaný nápad');
  } finally {
    await ctx.stop();
  }
});

test('regression: refine pre každú z 5 sekcií vráti validnú sekciu', async () => {
  const agent = createScriptedAgent('ok');
  const ctx = await startApp(agent);
  try {
    for (const tabKey of ['promo', 'roadmap', 'tech', 'marketing', 'antifail'] as const) {
      const res = await fetch(`${ctx.baseUrl}/api/refine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tabKey,
          instruction: 'Doplň konkrétnejšie kroky pre tento nápad',
          project: SAMPLE_PROJECT,
        }),
      });
      assert.equal(res.status, 200, `refine ${tabKey}`);
      const body = await res.json();
      assert.equal(body.tabKey, tabKey);
      assert.ok(body.sectionData && typeof body.sectionData === 'object', `sectionData pre ${tabKey}`);
    }
    assert.equal(agent.calls.length, 5, '5 volaní modelu');
  } finally {
    await ctx.stop();
  }
});

test('regression: transient 503 od modelu sa automaticky zopakuje (200)', async () => {
  const agent = createScriptedAgent('transient503');
  const ctx = await startApp(agent);
  try {
    const res = await postGenerate(ctx.baseUrl);
    assert.equal(res.status, 200);
    assert.ok(agent.calls.length >= 2, 'model bol volaný znova po 503');
  } finally {
    await ctx.stop();
  }
});

test('regression: nevalidný JSON od modelu prejde cez validačný retry (200)', async () => {
  const agent = createScriptedAgent('invalidThenValid');
  const ctx = await startApp(agent);
  try {
    const res = await postGenerate(ctx.baseUrl);
    assert.equal(res.status, 200);
    assert.ok(agent.calls.length >= 2, 'druhé volanie po nevalidnom JSON');
    assert.match(agent.calls[1], /DÔLEŽITÉ UPOZORNENIE PRE OPRAVU/, 'retry prompt obsahuje opravu');
  } finally {
    await ctx.stop();
  }
});

test('regression: trvalo nevalidný výstup modelu končí 502 s používateľskou chybou', async () => {
  const agent = createScriptedAgent('alwaysInvalid');
  const ctx = await startApp(agent);
  try {
    const res = await postGenerate(ctx.baseUrl);
    assert.equal(res.status, 502);
    const body = await res.json();
    assert.match(body.error, /nekompletnú štruktúru/i);
  } finally {
    await ctx.stop();
  }
});
