import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateGenerateBody,
  validateRefineBody,
  BUDGET_LEVELS,
  PROJECT_TYPES,
  SECTION_KEYS,
} from '../../server/validateInput.ts';
import { SAMPLE_PROJECT } from '../../src/data/sampleProjects.ts';

test('validateGenerateBody accepts a valid body', () => {
  const result = validateGenerateBody({
    idea: 'Aplikácia na sledovanie výdavkov pre študentov',
    targetAudience: 'študenti',
    budget: 'Nízky',
    projectType: 'Mobilná appka',
  });
  assert.ok('value' in result);
  assert.equal(result.value.idea, 'Aplikácia na sledovanie výdavkov pre študentov');
  assert.equal(result.value.budget, 'Nízky');
});

test('validateGenerateBody trims idea and defaults empty audience', () => {
  const result = validateGenerateBody({
    idea: '   AI asistent pre malé firmy na fakturáciu   ',
    targetAudience: '  ',
    budget: 'Stredný',
    projectType: 'SaaS',
  });
  assert.ok('value' in result);
  assert.equal(result.value.idea, 'AI asistent pre malé firmy na fakturáciu');
  assert.match(result.value.targetAudience, /Nešpecifikovaná/);
});

test('validateGenerateBody rejects too short / too long idea', () => {
  assert.ok('error' in validateGenerateBody({ idea: 'krátke', budget: 'Nízky', projectType: 'SaaS' }));
  const long = 'a'.repeat(2501);
  assert.ok('error' in validateGenerateBody({ idea: long, budget: 'Nízky', projectType: 'SaaS' }));
});

test('validateGenerateBody rejects non-whitelisted budget and projectType', () => {
  assert.ok('error' in validateGenerateBody({ idea: 'dostatočne dlhý nápad', budget: 'milión', projectType: 'SaaS' }));
  assert.ok('error' in validateGenerateBody({ idea: 'dostatočne dlhý nápad', budget: 'Nízky', projectType: 'Casino' }));
});

test('validateGenerateBody rejects non-object body and missing fields', () => {
  assert.ok('error' in validateGenerateBody(null));
  assert.ok('error' in validateGenerateBody('string'));
  assert.ok('error' in validateGenerateBody({}));
});

test('validateGenerateBody whitelist matches client types', () => {
  assert.deepEqual([...BUDGET_LEVELS], ['Nízky', 'Stredný', 'Startup']);
  assert.deepEqual([...PROJECT_TYPES], ['SaaS', 'Mobilná appka', 'E-commerce', 'Služba']);
});

test('validateRefineBody accepts a valid body with sample project', () => {
  const result = validateRefineBody({
    tabKey: 'promo',
    instruction: 'Zostri tón komunikácie',
    project: SAMPLE_PROJECT,
  });
  assert.ok('value' in result);
  assert.equal(result.value.tabKey, 'promo');
  assert.equal(result.value.project.title, SAMPLE_PROJECT.title);
});

test('validateRefineBody rejects invalid tabKey / short instruction / broken project', () => {
  assert.ok('error' in validateRefineBody({ tabKey: 'hack', instruction: 'uprav to', project: SAMPLE_PROJECT }));
  assert.ok('error' in validateRefineBody({ tabKey: 'promo', instruction: 'ab', project: SAMPLE_PROJECT }));
  assert.ok('error' in validateRefineBody({ tabKey: 'promo', instruction: 'uprav to', project: { title: '' } }));
  assert.ok('error' in validateRefineBody({ tabKey: 'promo', instruction: 'uprav to', project: null }));
  assert.ok('error' in validateRefineBody(undefined));
});

test('validateRefineBody section keys match workspace tabs', () => {
  assert.deepEqual([...SECTION_KEYS], ['promo', 'roadmap', 'tech', 'marketing', 'antifail']);
});
