// Offline demo „vygeneruj nápad“: spustí reálne API (loopback) so skriptovaným
// AI agentom (mock Gemini cez DI) a vygeneruje blueprint pre zadaný nápad.
// S reálnym GEMINI_API_KEY beží rovnaký pipeline proti živému modelu (viď
// docs/VERCEL_DEPLOY_MASTER_PROMPT.md §5). Spustenie: bun scripts/demo-generate.ts
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import type { GoogleGenAI } from '@google/genai';
import { createApiApp } from '../server/aiArchitect.ts';
import { SAMPLE_PROJECT } from '../src/data/sampleProjects.ts';

const IDEA = process.argv[2] ?? 'Aplikácia na triedenie domáceho odpadu podľa lokality a kalendára zvozu';

const mockAgent = {
  models: {
    generateContent: async (params: { contents?: unknown }) => {
      const prompt = String(params?.contents ?? '');
      const sectionMatch = prompt.match(/sekciu "(\w+)"/);
      if (sectionMatch) {
        return { text: JSON.stringify(SAMPLE_PROJECT.blueprint[sectionMatch[1] as keyof typeof SAMPLE_PROJECT.blueprint]) };
      }
      const blueprint = {
        ...SAMPLE_PROJECT.blueprint,
        promo: { ...SAMPLE_PROJECT.blueprint.promo, projectName: 'EkoTriedič', tagline: `„${IDEA.slice(0, 60)}“ — menej odpadu, viac poriadku` },
      };
      return { text: JSON.stringify(blueprint) };
    },
  },
} as unknown as GoogleGenAI;

const app = createApiApp({ aiClientFactory: () => mockAgent, rateLimit: false });
const server = app.listen(0, '127.0.0.1');
await once(server, 'listening');
const { port } = server.address() as AddressInfo;

const res = await fetch(`http://127.0.0.1:${port}/api/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    idea: IDEA,
    targetAudience: 'domácnosti na Slovensku',
    budget: 'Nízky',
    projectType: 'Mobilná appka',
  }),
});
const body = (await res.json()) as any;
server.close();

if (res.status !== 200) {
  console.error(`Chyba ${res.status}:`, body.error);
  process.exit(1);
}

const bp = body.blueprint;
console.log(`✅ Nápad: ${IDEA}`);
console.log(`📦 Projekt: ${bp.promo.projectName} — ${bp.promo.tagline}`);
console.log(`\nSekcie blueprintu (offline demo cez skriptovaný AI agent):`);
console.log(`  1. Promo & Koncept : ${bp.promo.promoPosts.length} príspevkov, ${bp.promo.brandDirection.colors.length} farieb`);
console.log(`  2. Roadmapa        : ${bp.roadmap.phases.length} fáz (${bp.roadmap.phases.map((p: { title: string }) => p.title).join(' → ')})`);
console.log(`  3. Tech návrh     : stack ${(Object.values(bp.tech.stack) as { name: string }[]).map((s) => s.name).join(', ')}`);
console.log(`  4. Marketing      : ${bp.marketing.pricingTiers.length} cenových balíkov, ${bp.marketing.first30DaysChecklist.length} úloh v prvých 30 dňoch`);
console.log(`  5. Anti-Fail      : ${bp.antifail.fatalMistakes.length} rizík, ${bp.antifail.ironRules.length} pravidiel, ${bp.antifail.scalingPlaybook.length} etáp škálovania`);
