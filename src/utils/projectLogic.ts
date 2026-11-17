import type {
  IdeaBlueprint,
  IdeaContextInput,
  LaunchTask,
  RoadmapPhase,
  SavedProject,
  WorkspaceTabKey,
} from '../types/project';

export interface ProgressStats {
  total: number;
  completed: number;
  percentage: number;
}

export function validateIdeaInput(idea: string): { valid: boolean; error?: string } {
  const trimmed = idea.trim();
  if (!trimmed) {
    return {
      valid: false,
      error: 'Najprv opíš svoj nápad aspoň jednou vetou.',
    };
  }
  if (trimmed.length < 10) {
    return {
      valid: false,
      error: 'Pridaj prosím o niečo podrobnejší opis (minimálne 10 znakov).',
    };
  }
  if (trimmed.length > 2500) {
    return {
      valid: false,
      error: 'Opis nápadu je príliš dlhý (maximum je 2 500 znakov).',
    };
  }
  return { valid: true };
}

export function calculateRoadmapProgress(phases: RoadmapPhase[]): ProgressStats {
  let total = 0;
  let completed = 0;
  for (const phase of phases) {
    for (const item of phase.items) {
      total += 1;
      if (item.done) {
        completed += 1;
      }
    }
  }
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentage };
}

export function calculatePhaseProgress(phase: RoadmapPhase): ProgressStats {
  const total = phase.items.length;
  const completed = phase.items.filter((item) => item.done).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentage };
}

export function calculateMarketingProgress(tasks: LaunchTask[]): ProgressStats {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.done).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentage };
}

export function toggleRoadmapItem(
  project: SavedProject,
  phaseNumber: number,
  itemId: string
): SavedProject {
  const updatedPhases = project.blueprint.roadmap.phases.map((phase) => {
    if (phase.phaseNumber !== phaseNumber) return phase;
    return {
      ...phase,
      items: phase.items.map((item) =>
        item.id === itemId ? { ...item, done: !item.done } : item
      ),
    };
  });

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    blueprint: {
      ...project.blueprint,
      roadmap: {
        ...project.blueprint.roadmap,
        phases: updatedPhases,
      },
    },
  };
}

export function toggleMarketingTask(project: SavedProject, taskId: string): SavedProject {
  const updatedChecklist = project.blueprint.marketing.first30DaysChecklist.map((task) =>
    task.id === taskId ? { ...task, done: !task.done } : task
  );

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    blueprint: {
      ...project.blueprint,
      marketing: {
        ...project.blueprint.marketing,
        first30DaysChecklist: updatedChecklist,
      },
    },
  };
}

export function updateBlueprintSection<K extends WorkspaceTabKey>(
  project: SavedProject,
  tabKey: K,
  sectionData: IdeaBlueprint[K]
): SavedProject {
  const updatedTitle =
    tabKey === 'promo'
      ? (sectionData as IdeaBlueprint['promo']).projectName || project.title
      : project.title;

  return {
    ...project,
    title: updatedTitle,
    updatedAt: new Date().toISOString(),
    blueprint: {
      ...project.blueprint,
      [tabKey]: sectionData,
    },
  };
}

export function createSavedProject(
  input: IdeaContextInput,
  blueprint: IdeaBlueprint,
  id?: string
): SavedProject {
  const now = new Date().toISOString();
  return {
    id: id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: blueprint.promo.projectName || 'Nový projekt',
    createdAt: now,
    updatedAt: now,
    input,
    blueprint,
  };
}

export function upsertProjectInHistory(
  history: SavedProject[],
  project: SavedProject
): SavedProject[] {
  const exists = history.some((item) => item.id === project.id);
  if (!exists) {
    return [project, ...history];
  }
  return history.map((item) => (item.id === project.id ? project : item));
}

export function renameProjectInHistory(
  history: SavedProject[],
  projectId: string,
  newTitle: string
): SavedProject[] {
  const trimmed = newTitle.trim();
  if (!trimmed) return history;
  return history.map((item) =>
    item.id === projectId
      ? {
          ...item,
          title: trimmed,
          updatedAt: new Date().toISOString(),
        }
      : item
  );
}

export function deleteProjectFromHistory(
  history: SavedProject[],
  projectId: string
): SavedProject[] {
  return history.filter((item) => item.id !== projectId);
}

export function formatSlovakDate(isoString: string): string {
  try {
    return new Intl.DateTimeFormat('sk-SK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoString));
  } catch {
    return isoString.slice(0, 10);
  }
}

export function exportProjectToMarkdown(project: SavedProject): string {
  const { promo, roadmap, tech, marketing, antifail } = project.blueprint;
  const lines: string[] = [];

  lines.push(`# ${project.title}`);
  lines.push(`> ${promo.tagline}`);
  lines.push('');
  lines.push(
    `**Typ projektu:** ${project.input.projectType} · **Rozpočet:** ${project.input.budget} · **Cieľová skupina:** ${
      project.input.targetAudience || 'Široká verejnosť'
    }`
  );
  lines.push('');
  lines.push('---');
  lines.push('');

  // 1. Promo & Koncept
  lines.push('## 1. Promo & Koncept');
  lines.push('');
  lines.push(`### Výťahový prejav (Elevator Pitch)`);
  lines.push(promo.elevatorPitch);
  lines.push('');
  lines.push(`### Hodnotová propozícia`);
  lines.push(promo.valueProposition);
  lines.push('');
  lines.push(`### Texty pre Hero sekciu`);
  lines.push(`- **Nadpis:** ${promo.heroCopy.headline}`);
  lines.push(`- **Podnadpis:** ${promo.heroCopy.subheadline}`);
  lines.push(`- **CTA tlačidlo:** ${promo.heroCopy.cta}`);
  lines.push('');
  lines.push(`### Promo príspevky`);
  for (const post of promo.promoPosts) {
    lines.push(`#### ${post.platform} — ${post.title}`);
    lines.push(post.content);
    lines.push('');
  }
  lines.push(`### Smerovanie značky`);
  lines.push(`**Tón komunikácie:** ${promo.brandDirection.toneOfVoice}`);
  lines.push('');
  for (const color of promo.brandDirection.colors) {
    lines.push(`- **${color.name}** (\`${color.hex}\`): ${color.usage}`);
  }
  lines.push('');

  // 2. Realizácia
  lines.push('## 2. Realizácia (Cesta k produktu)');
  lines.push('');
  for (const phase of roadmap.phases) {
    lines.push(`### ${phase.title} (${phase.duration})`);
    lines.push(`*Cieľ:* ${phase.goal}`);
    lines.push('');
    for (const item of phase.items) {
      lines.push(`- [${item.done ? 'x' : ' '}] ${item.text}`);
    }
    lines.push('');
  }

  // 3. Technický návrh
  lines.push('## 3. Technický návrh');
  lines.push('');
  lines.push('### Odporúčaný tech stack');
  lines.push(`- **Frontend:** ${tech.stack.frontend.name} — ${tech.stack.frontend.reason}`);
  lines.push(`- **Backend:** ${tech.stack.backend.name} — ${tech.stack.backend.reason}`);
  lines.push(`- **Databáza:** ${tech.stack.database.name} — ${tech.stack.database.reason}`);
  lines.push(`- **Autentifikácia:** ${tech.stack.auth.name} — ${tech.stack.auth.reason}`);
  lines.push(`- **Hosting:** ${tech.stack.hosting.name} — ${tech.stack.hosting.reason}`);
  lines.push('');
  lines.push('### Dátový model');
  for (const entity of tech.dataModel) {
    lines.push(`#### \`${entity.entity}\` — ${entity.description}`);
    for (const field of entity.fields) {
      lines.push(`- \`${field.name}\` (\`${field.type}\`)${field.note ? ` — ${field.note}` : ''}`);
    }
    lines.push('');
  }
  lines.push('### Kľúčové API endpointy');
  for (const ep of tech.apiEndpoints) {
    lines.push(`- \`${ep.method} ${ep.path}\` — ${ep.purpose}`);
  }
  lines.push('');
  lines.push('### Integrácie tretích strán');
  for (const integ of tech.integrations) {
    lines.push(`- **${integ.name}:** ${integ.purpose}`);
  }
  lines.push('');
  lines.push(`### Bezpečnosť a odhad nákladov na MVP`);
  lines.push(`**Odhad mesačných nákladov:** ${tech.mvpCostEstimate.monthlyEstimate}`);
  lines.push(tech.mvpCostEstimate.breakdown);
  for (const note of tech.securityNotes) {
    lines.push(`- ${note}`);
  }
  lines.push('');

  // 4. Marketingový plán
  lines.push('## 4. Marketingový plán');
  lines.push('');
  lines.push('### Monetizácia a cenotvorba');
  lines.push(marketing.monetizationStrategy);
  lines.push('');
  for (const tier of marketing.pricingTiers) {
    lines.push(`- **${tier.name}** (${tier.price}) — *${tier.target}*: ${tier.features.join(', ')}`);
  }
  lines.push('');
  lines.push('### Prvých 30 dní do spustenia');
  for (const task of marketing.first30DaysChecklist) {
    lines.push(`- [${task.done ? 'x' : ' '}] **${task.week}:** ${task.task}`);
  }
  lines.push('');
  lines.push('### Akvizičné kanály pre prvých 100 používateľov');
  for (const ch of marketing.acquisitionChannels) {
    lines.push(`- **${ch.channel}:** ${ch.tactic} *(Dopad: ${ch.expectedImpact})*`);
  }
  lines.push('');
  lines.push('### Kľúčové metriky (North Star)');
  for (const m of marketing.northStarMetrics) {
    lines.push(`- **${m.name}** (Cieľ: ${m.target}) — ${m.why}`);
  }
  lines.push('');

  // 5. Anti-Fail & Škálovanie
  lines.push('## 5. Anti-Fail & Škálovanie');
  lines.push('');
  lines.push('### Ako to nepokaziť na začiatku');
  antifail.fatalMistakes.forEach((m, idx) => {
    lines.push(`${idx + 1}. **${m.title}:** ${m.mistake} *Prevencia:* ${m.prevention}`);
  });
  lines.push('');
  lines.push('### Železné pravidlá');
  for (const r of antifail.ironRules) {
    lines.push(`- **[${r.category}] ${r.rule}** — ${r.rationale}`);
  }
  lines.push('');
  lines.push('### Ako správne škálovať počiatočný záujem');
  for (const stage of antifail.scalingPlaybook) {
    lines.push(`#### ${stage.stage}`);
    lines.push(`- **Hlavný fokus:** ${stage.focus}`);
    lines.push(`- **Spätná väzba:** ${stage.feedbackLoop}`);
    lines.push(`- **Retencia:** ${stage.retentionMechanic}`);
    lines.push(`- **Virálna slučka:** ${stage.viralLoop}`);
    lines.push(`- **Riešenie úzkych hrdiel:** ${stage.bottleneckFix}`);
    lines.push('');
  }

  return lines.join('\n');
}
