import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateMarketingProgress,
  calculatePhaseProgress,
  calculateRoadmapProgress,
  createSavedProject,
  deleteProjectFromHistory,
  exportProjectToMarkdown,
  renameProjectInHistory,
  toggleMarketingTask,
  toggleRoadmapItem,
  updateBlueprintSection,
  upsertProjectInHistory,
  validateIdeaInput,
} from './projectLogic';
import { SAMPLE_PROJECT } from '../data/sampleProjects';

test('validateIdeaInput rejects empty or too-short descriptions in Slovak', () => {
  assert.equal(validateIdeaInput('   ').valid, false);
  assert.equal(validateIdeaInput('appka').valid, false);
  assert.equal(validateIdeaInput('Digitálna platforma pre lokálne farmy na Slovensku').valid, true);
});

test('calculateRoadmapProgress computes total, completed, and percentage accurately', () => {
  const stats = calculateRoadmapProgress(SAMPLE_PROJECT.blueprint.roadmap.phases);
  assert.equal(stats.total > 0, true);
  assert.equal(stats.completed, 1);
  assert.equal(stats.percentage, Math.round((1 / stats.total) * 100));
});

test('toggleRoadmapItem flips completion state immutably and updates progress', () => {
  const before = calculatePhaseProgress(SAMPLE_PROJECT.blueprint.roadmap.phases[0]);
  const firstUnchecked = SAMPLE_PROJECT.blueprint.roadmap.phases[0].items.find((i) => !i.done);
  assert.ok(firstUnchecked);

  const updated = toggleRoadmapItem(SAMPLE_PROJECT, 1, firstUnchecked.id);
  const after = calculatePhaseProgress(updated.blueprint.roadmap.phases[0]);

  assert.equal(after.completed, before.completed + 1);
  assert.equal(
    SAMPLE_PROJECT.blueprint.roadmap.phases[0].items.find((i) => i.id === firstUnchecked.id)?.done,
    false
  );
});

test('toggleMarketingTask flips task completion state immutably', () => {
  const before = calculateMarketingProgress(SAMPLE_PROJECT.blueprint.marketing.first30DaysChecklist);
  const target = SAMPLE_PROJECT.blueprint.marketing.first30DaysChecklist[0];
  const updated = toggleMarketingTask(SAMPLE_PROJECT, target.id);
  const after = calculateMarketingProgress(updated.blueprint.marketing.first30DaysChecklist);

  assert.equal(after.completed, target.done ? before.completed - 1 : before.completed + 1);
});

test('history operations upsert, rename, and delete cleanly', () => {
  const created = createSavedProject(
    {
      idea: 'Testovací nápad pre automatizáciu účtovníctva živnostníkov.',
      targetAudience: 'SZČO na Slovensku',
      budget: 'Nízky',
      projectType: 'SaaS',
    },
    SAMPLE_PROJECT.blueprint,
    'proj_test_1'
  );

  let history = upsertProjectInHistory([SAMPLE_PROJECT], created);
  assert.equal(history.length, 2);
  assert.equal(history[0].id, 'proj_test_1');

  history = renameProjectInHistory(history, 'proj_test_1', 'Fakturačný Asistent');
  assert.equal(history.find((p) => p.id === 'proj_test_1')?.title, 'Fakturačný Asistent');

  history = deleteProjectFromHistory(history, 'proj_test_1');
  assert.equal(history.length, 1);
  assert.equal(history[0].id, SAMPLE_PROJECT.id);
});

test('updateBlueprintSection updates only the targeted section', () => {
  const updatedPromo = {
    ...SAMPLE_PROJECT.blueprint.promo,
    projectName: 'Zelený Kôš SK',
  };
  const next = updateBlueprintSection(SAMPLE_PROJECT, 'promo', updatedPromo);
  assert.equal(next.title, 'Zelený Kôš SK');
  assert.equal(next.blueprint.promo.projectName, 'Zelený Kôš SK');
  assert.deepEqual(next.blueprint.tech, SAMPLE_PROJECT.blueprint.tech);
});

test('exportProjectToMarkdown includes all 5 Slovak sections', () => {
  const md = exportProjectToMarkdown(SAMPLE_PROJECT);
  assert.match(md, /## 1\. Promo & Koncept/);
  assert.match(md, /## 2\. Realizácia/);
  assert.match(md, /## 3\. Technický návrh/);
  assert.match(md, /## 4\. Marketingový plán/);
  assert.match(md, /## 5\. Anti-Fail & Škálovanie/);
});
