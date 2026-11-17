import type {
  IdeaBlueprint,
  IdeaContextInput,
  SavedProject,
  WorkspaceTabKey,
} from '../types';

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
  if (trimmed.length > 2000) {
    return {
      valid: false,
      error: 'Opis nápadu je príliš dlhý (maximum je 2 000 znakov).',
    };
  }
  return { valid: true };
}

export function calculateRoadmapProgress(
  phases: IdeaBlueprint['roadmap']['phases'] | undefined
): ProgressStats {
  if (!Array.isArray(phases)) {
    return { total: 0, completed: 0, percentage: 0 };
  }
  let total = 0;
  let completed = 0;
  for (const phase of phases) {
    if (Array.isArray(phase.items)) {
      for (const item of phase.items) {
        total += 1;
        if (item.done) {
          completed += 1;
        }
      }
    }
  }
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, percentage };
}

export function calculateMarketingProgress(
  tasks: IdeaBlueprint['marketingPlan']['first30DaysChecklist'] | undefined
): ProgressStats {
  if (!Array.isArray(tasks)) {
    return { total: 0, completed: 0, percentage: 0 };
  }
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
  const phases = project.blueprint.roadmap.phases || [];
  const updatedPhases = phases.map((phase) => {
    if (phase.phaseNumber !== phaseNumber) return phase;
    const items = phase.items || [];
    return {
      ...phase,
      items: items.map((item) =>
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
  const checklist = project.blueprint.marketingPlan.first30DaysChecklist || [];
  const updatedChecklist = checklist.map((task) =>
    task.id === taskId ? { ...task, done: !task.done } : task
  );

  return {
    ...project,
    updatedAt: new Date().toISOString(),
    blueprint: {
      ...project.blueprint,
      marketingPlan: {
        ...project.blueprint.marketingPlan,
        first30DaysChecklist: updatedChecklist,
      },
    },
  };
}

export function updateBlueprintSection<K extends keyof IdeaBlueprint>(
  project: SavedProject,
  sectionKey: K,
  sectionData: IdeaBlueprint[K]
): SavedProject {
  const updatedTitle =
    sectionKey === 'promoKit'
      ? (sectionData as IdeaBlueprint['promoKit']).name || project.title
      : project.title;

  return {
    ...project,
    title: updatedTitle,
    updatedAt: new Date().toISOString(),
    blueprint: {
      ...project.blueprint,
      [sectionKey]: sectionData,
    },
  };
}

export function createSavedProject(
  input: IdeaContextInput,
  blueprint: IdeaBlueprint,
  providerUsed?: string,
  id?: string
): SavedProject {
  const now = new Date().toISOString();
  return {
    id: id || `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    title: blueprint.promoKit?.name || 'Nový projekt',
    createdAt: now,
    updatedAt: now,
    input,
    blueprint,
    providerUsed,
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
  const { promoKit, roadmap, techArchitecture, marketingPlan, antiFailAndScaling } =
    project.blueprint;
  const lines: string[] = [];

  lines.push(`# ${project.title}`);
  lines.push(`> ${promoKit?.tagline || ''}`);
  lines.push('');
  lines.push(
    `**Typ projektu:** ${project.input.projectType} · **Rozpočet:** ${
      project.input.budget
    } · **Cieľová skupina:** ${project.input.targetAudience || 'Široká verejnosť'}`
  );
  if (project.providerUsed) {
    lines.push(`**AI Engine:** ${project.providerUsed}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // 1. Promo & Koncept
  lines.push('## 1. Promo & Koncept');
  lines.push('');
  lines.push(`### Výťahový prejav (Elevator Pitch)`);
  lines.push(promoKit?.elevatorPitch || '');
  lines.push('');
  lines.push(`### Hodnotová propozícia`);
  lines.push(promoKit?.valueProposition || '');
  lines.push('');
  lines.push(`### Texty pre Hero sekciu`);
  lines.push(`- **Nadpis:** ${promoKit?.heroCopy?.headline || ''}`);
  lines.push(`- **Podnadpis:** ${promoKit?.heroCopy?.subheadline || ''}`);
  lines.push(`- **CTA tlačidlo:** ${promoKit?.heroCopy?.cta || ''}`);
  lines.push('');
  lines.push(`### Promo príspevky`);
  for (const post of promoKit?.promoPosts || []) {
    lines.push(`#### ${post.platform} — ${post.title}`);
    lines.push(post.content);
    lines.push('');
  }
  lines.push(`### Smerovanie značky`);
  lines.push(`**Tón komunikácie:** ${promoKit?.brandPalette?.toneOfVoice || ''}`);
  lines.push('');
  for (const color of promoKit?.brandPalette?.colors || []) {
    lines.push(`- **${color.name}** (\`${color.hex}\`): ${color.usage}`);
  }
  lines.push('');

  // 2. Realizácia
  lines.push('## 2. Realizácia (Cesta k produktu)');
  lines.push('');
  for (const phase of roadmap?.phases || []) {
    lines.push(`### ${phase.title} (${phase.duration})`);
    lines.push(`*Cieľ:* ${phase.goal}`);
    lines.push('');
    for (const item of phase.items || []) {
      lines.push(`- [${item.done ? 'x' : ' '}] ${item.text}`);
    }
    lines.push('');
  }

  // 3. Technický návrh
  lines.push('## 3. Technický návrh');
  lines.push('');
  lines.push('### Odporúčaný tech stack');
  if (techArchitecture?.stack) {
    lines.push(
      `- **Frontend:** ${techArchitecture.stack.frontend?.name || ''} — ${
        techArchitecture.stack.frontend?.reason || ''
      }`
    );
    lines.push(
      `- **Backend:** ${techArchitecture.stack.backend?.name || ''} — ${
        techArchitecture.stack.backend?.reason || ''
      }`
    );
    lines.push(
      `- **Databáza:** ${techArchitecture.stack.database?.name || ''} — ${
        techArchitecture.stack.database?.reason || ''
      }`
    );
    lines.push(
      `- **Autentifikácia:** ${techArchitecture.stack.auth?.name || ''} — ${
        techArchitecture.stack.auth?.reason || ''
      }`
    );
    lines.push(
      `- **Hosting:** ${techArchitecture.stack.hosting?.name || ''} — ${
        techArchitecture.stack.hosting?.reason || ''
      }`
    );
  }
  lines.push('');
  lines.push('### Dátový model');
  for (const entity of techArchitecture?.dataModel || []) {
    lines.push(`#### \`${entity.entity}\` — ${entity.description}`);
    for (const field of entity.fields || []) {
      lines.push(
        `- \`${field.name}\` (\`${field.type}\`)${field.note ? ` — ${field.note}` : ''}`
      );
    }
    lines.push('');
  }
  lines.push('### Kľúčové API endpointy');
  for (const ep of techArchitecture?.apiEndpoints || []) {
    lines.push(`- \`${ep.method} ${ep.path}\` — ${ep.purpose}`);
  }
  lines.push('');
  lines.push('### Integrácie tretích strán');
  for (const integ of techArchitecture?.integrations || []) {
    lines.push(`- **${integ.name}:** ${integ.purpose}`);
  }
  lines.push('');
  lines.push(`### Bezpečnosť a odhad nákladov na MVP`);
  lines.push(
    `**Odhad mesačných nákladov:** ${
      techArchitecture?.mvpCostEstimate?.monthlyEstimate || ''
    }`
  );
  lines.push(techArchitecture?.mvpCostEstimate?.breakdown || '');
  for (const note of techArchitecture?.securityNotes || []) {
    lines.push(`- ${note}`);
  }
  lines.push('');

  // 4. Marketingový plán
  lines.push('## 4. Marketingový plán');
  lines.push('');
  lines.push('### Monetizácia a cenotvorba');
  lines.push(marketingPlan?.monetizationStrategy || '');
  lines.push('');
  for (const tier of marketingPlan?.pricingTiers || []) {
    lines.push(
      `- **${tier.name}** (${tier.price}) — *${tier.target}*: ${(
        tier.features || []
      ).join(', ')}`
    );
  }
  lines.push('');
  lines.push('### Prvých 30 dní do spustenia');
  for (const task of marketingPlan?.first30DaysChecklist || []) {
    lines.push(`- [${task.done ? 'x' : ' '}] **${task.week}:** ${task.task}`);
  }
  lines.push('');
  lines.push('### Akvizičné kanály pre prvých 100 používateľov');
  for (const ch of marketingPlan?.acquisitionChannels || []) {
    lines.push(`- **${ch.channel}:** ${ch.tactic} *(Dopad: ${ch.expectedImpact})*`);
  }
  lines.push('');
  lines.push('### Kľúčové metriky (North Star)');
  for (const m of marketingPlan?.northStarMetrics || []) {
    lines.push(`- **${m.name}** (Cieľ: ${m.target}) — ${m.why}`);
  }
  lines.push('');

  // 5. Anti-Fail & Škálovanie
  lines.push('## 5. Anti-Fail & Škálovanie');
  lines.push('');
  lines.push('### Ako to nepokaziť na začiatku');
  (antiFailAndScaling?.fatalMistakes || []).forEach((m, idx) => {
    lines.push(`${idx + 1}. **${m.title}:** ${m.mistake} *Prevencia:* ${m.prevention}`);
  });
  lines.push('');
  lines.push('### Železné pravidlá');
  for (const r of antiFailAndScaling?.ironRules || []) {
    lines.push(`- **[${r.category}] ${r.rule}** — ${r.rationale}`);
  }
  lines.push('');
  lines.push('### Ako správne škálovať počiatočný záujem');
  for (const stage of antiFailAndScaling?.scalingPlaybook || []) {
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
