import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mergeImportedProjects,
  parseProjectsBackup,
  serializeProjectsBackup,
  upsertProjectInHistory,
  BACKUP_FORMAT,
  BACKUP_VERSION,
} from '../../src/utils/projectLogic.ts';
import { SAMPLE_PROJECT } from '../../src/data/sampleProjects.ts';

test('backup: serialize -> parse round-trip zachová projekty', () => {
  const projects = [SAMPLE_PROJECT];
  const raw = serializeProjectsBackup(projects);
  const parsedJson = JSON.parse(raw);
  assert.equal(parsedJson.format, BACKUP_FORMAT);
  assert.equal(parsedJson.version, BACKUP_VERSION);
  assert.ok(typeof parsedJson.exportedAt === 'string');

  const result = parseProjectsBackup(raw);
  assert.ok('projects' in result);
  assert.deepEqual(result.projects, projects);
});

test('backup: parse odmietne neplatný JSON, ne-array a neplatný projekt', () => {
  assert.ok('error' in parseProjectsBackup('nie je json'));
  assert.ok('error' in parseProjectsBackup('{"foo": 1}'));
  assert.ok('error' in parseProjectsBackup('[]') === false, 'prázdne pole je validné (0 projektov)');
  assert.ok('error' in parseProjectsBackup(JSON.stringify({ projects: [{ id: 'x' }] })));
  assert.ok('error' in parseProjectsBackup(JSON.stringify([SAMPLE_PROJECT, { title: 'bez id' }])));
});

test('backup: projekt musí mať všetkých 5 sekcií blueprintu', () => {
  const broken = JSON.parse(JSON.stringify(SAMPLE_PROJECT));
  delete broken.blueprint.antifail;
  const result = parseProjectsBackup(JSON.stringify({ projects: [broken] }));
  assert.ok('error' in result);
});

test('backup: merge importovaných projektov deduplikuje podľa id (upsert)', () => {
  const history = [SAMPLE_PROJECT];
  const updated = { ...SAMPLE_PROJECT, title: 'Premenovaný projekt' };
  const merged = mergeImportedProjects(history, [updated]);
  assert.equal(merged.length, 1, 'stále jeden projekt');
  assert.equal(merged[0].title, 'Premenovaný projekt', 'existujúci sa prepíše novšou verziou');

  const other = { ...SAMPLE_PROJECT, id: 'iny-id', title: 'Nový projekt' };
  const merged2 = mergeImportedProjects(history, [other]);
  assert.equal(merged2.length, 2, 'nový projekt sa pridá');
  assert.equal(merged2[0].id, 'iny-id', 'nové idú na začiatok');
});

test('backup: upsertProjectInHistory pridáva/prepisuje', () => {
  const list = upsertProjectInHistory([], SAMPLE_PROJECT);
  assert.equal(list.length, 1);
  const again = upsertProjectInHistory(list, { ...SAMPLE_PROJECT, title: 'X' });
  assert.equal(again.length, 1);
  assert.equal(again[0].title, 'X');
});
