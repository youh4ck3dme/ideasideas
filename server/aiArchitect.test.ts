import test from 'node:test';
import assert from 'node:assert/strict';
import {
  fullBlueprintSchema,
  parseJsonResponse,
  promoSchema,
  validateBlueprint,
  validateSectionData,
} from './aiArchitect.ts';
import { SAMPLE_PROJECT } from '../src/data/sampleProjects.ts';

test('validateBlueprint accepts complete SAMPLE_PROJECT blueprint', () => {
  const err = validateBlueprint(SAMPLE_PROJECT.blueprint);
  assert.equal(err, null);
});

test('validateBlueprint rejects antifail with fewer than 5 ironRules', () => {
  const broken = structuredClone(SAMPLE_PROJECT.blueprint);
  broken.antifail.ironRules = broken.antifail.ironRules.slice(0, 3);
  const err = validateBlueprint(broken);
  assert.ok(err && err.includes('5 železných pravidiel'));
});

test('validateBlueprint rejects antifail with fewer than 5 fatalMistakes', () => {
  const broken = structuredClone(SAMPLE_PROJECT.blueprint);
  broken.antifail.fatalMistakes = broken.antifail.fatalMistakes.slice(0, 4);
  const err = validateBlueprint(broken);
  assert.ok(err && err.includes('5 kritických chýb'));
});

test('validateSectionData validates individual tab sections cleanly', () => {
  assert.equal(validateSectionData('promo', SAMPLE_PROJECT.blueprint.promo), null);
  assert.equal(validateSectionData('roadmap', SAMPLE_PROJECT.blueprint.roadmap), null);
  assert.equal(validateSectionData('tech', SAMPLE_PROJECT.blueprint.tech), null);
  assert.equal(validateSectionData('marketing', SAMPLE_PROJECT.blueprint.marketing), null);
  assert.equal(validateSectionData('antifail', SAMPLE_PROJECT.blueprint.antifail), null);
});

test('fullBlueprintSchema and promoSchema enforce exact array bounds', () => {
  assert.equal(fullBlueprintSchema.required?.length, 5);
  assert.equal(promoSchema.properties?.promoPosts?.minItems, '3');
  assert.equal(promoSchema.properties?.promoPosts?.maxItems, '3');
});

test('parseJsonResponse strips markdown code fences and rejects empty/invalid JSON', () => {
  const parsed = parseJsonResponse('```json\n{"ok": true}\n```') as { ok: boolean };
  assert.equal(parsed.ok, true);
  assert.throws(() => parseJsonResponse('   '), /VALIDATION_EMPTY_RESPONSE/);
  assert.throws(() => parseJsonResponse('{bad json'), /VALIDATION_INVALID_JSON/);
});
