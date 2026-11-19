export const BUDGET_LEVELS = ['Nízky', 'Stredný', 'Startup'] as const;
export const PROJECT_TYPES = ['SaaS', 'Mobilná appka', 'E-commerce', 'Služba'] as const;
export const SECTION_KEYS = ['promo', 'roadmap', 'tech', 'marketing', 'antifail'] as const;

export const IDEA_MIN_LENGTH = 10;
export const IDEA_MAX_LENGTH = 2500;
export const AUDIENCE_MAX_LENGTH = 200;
export const INSTRUCTION_MIN_LENGTH = 3;
export const INSTRUCTION_MAX_LENGTH = 500;
export const PROJECT_TITLE_MAX_LENGTH = 120;

export interface ValidatedGenerateBody {
  idea: string;
  targetAudience: string;
  budget: string;
  projectType: string;
}

export interface ValidatedRefineBody {
  tabKey: (typeof SECTION_KEYS)[number];
  instruction: string;
  project: {
    title: string;
    input: Record<string, unknown>;
    blueprint: Record<string, unknown>;
  };
}

function asRecord(val: unknown): Record<string, unknown> | null {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
    ? (val as Record<string, unknown>)
    : null;
}

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function validateGenerateBody(body: unknown): { error: string } | { value: ValidatedGenerateBody } {
  const record = asRecord(body);
  if (!record) {
    return { error: 'Neplatné telo požiadavky.' };
  }

  const idea = isString(record.idea) ? record.idea.trim() : '';
  if (idea.length < IDEA_MIN_LENGTH) {
    return { error: `Opíš prosím svoj nápad podrobnejšie (minimálne ${IDEA_MIN_LENGTH} znakov).` };
  }
  if (idea.length > IDEA_MAX_LENGTH) {
    return { error: `Opis nápadu je príliš dlhý (maximum je ${IDEA_MAX_LENGTH} znakov).` };
  }

  const targetAudienceRaw = isString(record.targetAudience) ? record.targetAudience.trim() : '';
  if (targetAudienceRaw.length > AUDIENCE_MAX_LENGTH) {
    return { error: `Cieľová skupina je príliš dlhá (maximum je ${AUDIENCE_MAX_LENGTH} znakov).` };
  }
  const targetAudience = targetAudienceRaw || 'Nešpecifikovaná (navrhni najvhodnejšiu)';

  const budget = isString(record.budget) ? record.budget : '';
  if (!(BUDGET_LEVELS as readonly string[]).includes(budget)) {
    return { error: 'Neplatná hodnota rozpočtu.' };
  }

  const projectType = isString(record.projectType) ? record.projectType : '';
  if (!(PROJECT_TYPES as readonly string[]).includes(projectType)) {
    return { error: 'Neplatný typ projektu.' };
  }

  return { value: { idea, targetAudience, budget, projectType } };
}

export function validateRefineBody(body: unknown): { error: string } | { value: ValidatedRefineBody } {
  const record = asRecord(body);
  if (!record) {
    return { error: 'Neplatné telo požiadavky.' };
  }

  const tabKey = isString(record.tabKey) ? record.tabKey : '';
  if (!(SECTION_KEYS as readonly string[]).includes(tabKey)) {
    return { error: 'Neplatná sekcia na úpravu.' };
  }

  const instruction = isString(record.instruction) ? record.instruction.trim() : '';
  if (instruction.length < INSTRUCTION_MIN_LENGTH) {
    return { error: 'Zadaj prosím jasnú inštrukciu na úpravu tejto sekcie.' };
  }
  if (instruction.length > INSTRUCTION_MAX_LENGTH) {
    return { error: `Inštrukcia je príliš dlhá (maximum je ${INSTRUCTION_MAX_LENGTH} znakov).` };
  }

  const project = asRecord(record.project);
  const title = project && isString(project.title) ? project.title.trim() : '';
  if (!project || !title || title.length > PROJECT_TITLE_MAX_LENGTH) {
    return { error: 'Chýba alebo neplatný projekt na úpravu.' };
  }
  const input = asRecord(project.input);
  const blueprint = asRecord(project.blueprint);
  if (!input || !blueprint) {
    return { error: 'Projekt nemá kompletnú štruktúru (input/blueprint).' };
  }

  return {
    value: {
      tabKey: tabKey as ValidatedRefineBody['tabKey'],
      instruction,
      project: { title, input, blueprint },
    },
  };
}
