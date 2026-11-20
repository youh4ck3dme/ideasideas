import test from 'node:test';
import type { IdeaContextInput } from '../../src/types/project';
import assert from 'node:assert/strict';

// In-memory localStorage shim pre node:test
const store = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  },
  configurable: true,
});

const {
  getPendingGenerations,
  enqueuePendingGeneration,
  removePendingGeneration,
  clearPendingGenerations,
} = await import('../../src/utils/offlineQueue.ts');

const input = (idea: string): IdeaContextInput => ({
  idea,
  targetAudience: '',
  budget: 'Nízky',
  projectType: 'SaaS',
});

test.beforeEach(() => store.clear());

test('offline queue: enqueue/get/remove/clear round-trip cez localStorage', () => {
  assert.deepEqual(getPendingGenerations(), []);
  enqueuePendingGeneration(input('Prvý nápad dostatočne dlhý na frontu'));
  enqueuePendingGeneration(input('Druhý nápad dostatočne dlhý na frontu'));
  let queue = getPendingGenerations();
  assert.equal(queue.length, 2);
  assert.equal(queue[0].idea.startsWith('Druhý'), true, 'novšie na začiatok');

  // dedupe podľa idea
  enqueuePendingGeneration(input('Prvý nápad dostatočne dlhý na frontu'));
  queue = getPendingGenerations();
  assert.equal(queue.length, 2, 'rovnaký nápad sa nezduplikuje');

  removePendingGeneration('Prvý nápad dostatočne dlhý na frontu');
  queue = getPendingGenerations();
  assert.equal(queue.length, 1);

  clearPendingGenerations();
  assert.deepEqual(getPendingGenerations(), []);
});

test('offline queue: odmietne nevalidný vstup a oreže frontu na max 10', () => {
  enqueuePendingGeneration({ idea: 'krátke', targetAudience: '', budget: 'Nízky', projectType: 'SaaS' });
  assert.equal(getPendingGenerations().length, 0, 'príliš krátky nápad sa neuloží');
  for (let i = 0; i < 15; i++) {
    enqueuePendingGeneration(input(`Nápad číslo ${i} dostatočne dlhý na frontu`));
  }
  assert.equal(getPendingGenerations().length, 10, 'max 10 položiek vo fronte');
});

test('offline queue: poškodený localStorage nepadá', () => {
  store.set('ideaforge_pending_generate_v1', '{zly json');
  assert.deepEqual(getPendingGenerations(), []);
});
