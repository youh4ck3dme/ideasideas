import express from 'express';
import { GoogleGenAI, ThinkingLevel, Type, type Schema } from '@google/genai';
import { checkRateLimit } from '../lib/rate-limiter.ts';
import { applySecurity } from './security.ts';
import { validateGenerateBody, validateRefineBody } from './validateInput.ts';

export const MODEL_ID = 'gemini-4-hydrogen';

export function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export const promoSchema: Schema = {
  type: Type.OBJECT,
  description: 'Promo & Koncept sekcia pre kartu 1 (promoKit).',
  properties: {
    projectName: {
      type: Type.STRING,
      description: 'Originálny a zapamätateľný názov projektu v slovenčine alebo medzinárodne použiteľný názov.',
    },
    tagline: {
      type: Type.STRING,
      description: 'Krátky úderný slogan (max 12 slov) v slovenčine.',
    },
    elevatorPitch: {
      type: Type.STRING,
      description: 'Výťahový prejav v rozsahu 2-3 jasných viet v slovenčine.',
    },
    valueProposition: {
      type: Type.STRING,
      description: 'Hlavná hodnotová propozícia pre cieľového zákazníka v slovenčine.',
    },
    heroCopy: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING, description: 'Hlavný hero nadpis pre webovú stránku v slovenčine.' },
        subheadline: { type: Type.STRING, description: 'Doplňujúci podnadpis vysvetľujúci prínos v slovenčine.' },
        cta: { type: Type.STRING, description: 'Text primárneho CTA tlačidla v slovenčine.' },
      },
      required: ['headline', 'subheadline', 'cta'],
    },
    promoPosts: {
      type: Type.ARRAY,
      minItems: '3',
      maxItems: '3',
      description: 'Presne 3 promo príspevky: LinkedIn, Instagram / TikTok, Product Hunt.',
      items: {
        type: Type.OBJECT,
        properties: {
          platform: {
            type: Type.STRING,
            description: 'Platforma príspevku: LinkedIn, Instagram / TikTok alebo Product Hunt.',
          },
          title: { type: Type.STRING, description: 'Krátky názov príspevku v slovenčine.' },
          content: { type: Type.STRING, description: 'Hotový text príspevku alebo video scenár v slovenčine.' },
        },
        required: ['platform', 'title', 'content'],
      },
    },
    brandDirection: {
      type: Type.OBJECT,
      properties: {
        toneOfVoice: { type: Type.STRING, description: 'Opis tónu komunikácie značky v slovenčine.' },
        colors: {
          type: Type.ARRAY,
          minItems: '3',
          maxItems: '3',
          description: 'Presne 3 odporúčané farby palety značky.',
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Slovenský názov farby.' },
              hex: { type: Type.STRING, description: 'HEX kód farby vo formáte #RRGGBB, napr. #2563EB.' },
              usage: { type: Type.STRING, description: 'Na čo sa farba v UI používa.' },
            },
            required: ['name', 'hex', 'usage'],
          },
        },
      },
      required: ['toneOfVoice', 'colors'],
    },
  },
  required: [
    'projectName',
    'tagline',
    'elevatorPitch',
    'valueProposition',
    'heroCopy',
    'promoPosts',
    'brandDirection',
  ],
};

export const roadmapSchema: Schema = {
  type: Type.OBJECT,
  description: 'Realizačný plán pre kartu 2 (roadmap).',
  properties: {
    phases: {
      type: Type.ARRAY,
      minItems: '3',
      maxItems: '3',
      description: 'Presne 3 fázy: Fáza 1: Validácia, Fáza 2: MVP, Fáza 3: Finálny produkt.',
      items: {
        type: Type.OBJECT,
        properties: {
          phaseNumber: { type: Type.INTEGER, description: 'Číslo fázy: 1, 2 alebo 3.' },
          title: { type: Type.STRING, description: 'Názov fázy v slovenčine.' },
          duration: { type: Type.STRING, description: 'Odhadované trvanie v slovenčine, napr. 1. – 3. týždeň.' },
          goal: { type: Type.STRING, description: 'Hlavný merateľný cieľ fázy v slovenčine.' },
          items: {
            type: Type.ARRAY,
            minItems: '3',
            maxItems: '6',
            description: '3 až 6 konkrétnych akčných úloh pre túto fázu.',
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: 'Krátke unikátne ID, napr. p1_1.' },
                text: { type: Type.STRING, description: 'Konkrétna akčná úloha v slovenčine.' },
                done: { type: Type.BOOLEAN, description: 'Predvolene false.' },
              },
              required: ['id', 'text', 'done'],
            },
          },
        },
        required: ['phaseNumber', 'title', 'duration', 'goal', 'items'],
      },
    },
  },
  required: ['phases'],
};

export const techSchema: Schema = {
  type: Type.OBJECT,
  description: 'Technický návrh pre kartu 3 (techArchitecture).',
  properties: {
    stack: {
      type: Type.OBJECT,
      properties: {
        frontend: {
          type: Type.OBJECT,
          properties: { name: { type: Type.STRING }, reason: { type: Type.STRING } },
          required: ['name', 'reason'],
        },
        backend: {
          type: Type.OBJECT,
          properties: { name: { type: Type.STRING }, reason: { type: Type.STRING } },
          required: ['name', 'reason'],
        },
        database: {
          type: Type.OBJECT,
          properties: { name: { type: Type.STRING }, reason: { type: Type.STRING } },
          required: ['name', 'reason'],
        },
        auth: {
          type: Type.OBJECT,
          properties: { name: { type: Type.STRING }, reason: { type: Type.STRING } },
          required: ['name', 'reason'],
        },
        hosting: {
          type: Type.OBJECT,
          properties: { name: { type: Type.STRING }, reason: { type: Type.STRING } },
          required: ['name', 'reason'],
        },
      },
      required: ['frontend', 'backend', 'database', 'auth', 'hosting'],
    },
    dataModel: {
      type: Type.ARRAY,
      minItems: '3',
      maxItems: '5',
      description: '3 až 5 kľúčových databázových entít.',
      items: {
        type: Type.OBJECT,
        properties: {
          entity: { type: Type.STRING, description: 'Názov tabuľky alebo kolekcie v snake_case.' },
          description: { type: Type.STRING, description: 'Účel entity v slovenčine.' },
          fields: {
            type: Type.ARRAY,
            minItems: '3',
            maxItems: '7',
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING },
                note: { type: Type.STRING },
              },
              required: ['name', 'type'],
            },
          },
        },
        required: ['entity', 'description', 'fields'],
      },
    },
    apiEndpoints: {
      type: Type.ARRAY,
      minItems: '3',
      maxItems: '6',
      description: '3 až 6 kľúčových API endpointov.',
      items: {
        type: Type.OBJECT,
        properties: {
          method: {
            type: Type.STRING,
            enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          },
          path: { type: Type.STRING },
          purpose: { type: Type.STRING },
        },
        required: ['method', 'path', 'purpose'],
      },
    },
    integrations: {
      type: Type.ARRAY,
      minItems: '2',
      maxItems: '5',
      description: '2 až 5 integrácií tretích strán.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          purpose: { type: Type.STRING },
        },
        required: ['name', 'purpose'],
      },
    },
    securityNotes: {
      type: Type.ARRAY,
      minItems: '2',
      maxItems: '5',
      description: '2 až 5 bezpečnostných opatrení v slovenčine.',
      items: { type: Type.STRING },
    },
    mvpCostEstimate: {
      type: Type.OBJECT,
      properties: {
        monthlyEstimate: { type: Type.STRING, description: 'Odhad mesačných nákladov v EUR (€).' },
        breakdown: { type: Type.STRING, description: 'Rozpis položiek v slovenčine.' },
      },
      required: ['monthlyEstimate', 'breakdown'],
    },
  },
  required: [
    'stack',
    'dataModel',
    'apiEndpoints',
    'integrations',
    'securityNotes',
    'mvpCostEstimate',
  ],
};

export const marketingSchema: Schema = {
  type: Type.OBJECT,
  description: 'Marketingový plán pre kartu 4 (marketingPlan).',
  properties: {
    monetizationStrategy: {
      type: Type.STRING,
      description: 'Jasná stratégia monetizácie v slovenčine.',
    },
    pricingTiers: {
      type: Type.ARRAY,
      minItems: '2',
      maxItems: '3',
      description: '2 až 3 cenové balíky v EUR (€).',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.STRING },
          target: { type: Type.STRING },
          features: {
            type: Type.ARRAY,
            minItems: '2',
            maxItems: '5',
            items: { type: Type.STRING },
          },
        },
        required: ['name', 'price', 'target', 'features'],
      },
    },
    first30DaysChecklist: {
      type: Type.ARRAY,
      minItems: '4',
      maxItems: '6',
      description: '4 až 6 konkrétnych krokov na prvých 30 dní (1. až 4. týždeň).',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          week: { type: Type.STRING },
          task: { type: Type.STRING },
          done: { type: Type.BOOLEAN },
        },
        required: ['id', 'week', 'task', 'done'],
      },
    },
    acquisitionChannels: {
      type: Type.ARRAY,
      minItems: '3',
      maxItems: '4',
      description: '3 až 4 najlepšie akvizičné kanály pre prvých 100 používateľov.',
      items: {
        type: Type.OBJECT,
        properties: {
          channel: { type: Type.STRING },
          tactic: { type: Type.STRING },
          expectedImpact: { type: Type.STRING },
        },
        required: ['channel', 'tactic', 'expectedImpact'],
      },
    },
    northStarMetrics: {
      type: Type.ARRAY,
      minItems: '2',
      maxItems: '4',
      description: '2 až 4 hlavné North Star metriky.',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          target: { type: Type.STRING },
          why: { type: Type.STRING },
        },
        required: ['name', 'target', 'why'],
      },
    },
  },
  required: [
    'monetizationStrategy',
    'pricingTiers',
    'first30DaysChecklist',
    'acquisitionChannels',
    'northStarMetrics',
  ],
};

export const antifailSchema: Schema = {
  type: Type.OBJECT,
  description: 'Anti-Fail & Škálovanie pre kartu 5 (antiFailAndScaling).',
  properties: {
    fatalMistakes: {
      type: Type.ARRAY,
      minItems: '5',
      maxItems: '5',
      description: 'Presne 5 najčastejších chýb špecifických pre tento nápad a ako sa im vyhnúť.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          mistake: { type: Type.STRING },
          prevention: { type: Type.STRING },
        },
        required: ['title', 'mistake', 'prevention'],
      },
    },
    ironRules: {
      type: Type.ARRAY,
      minItems: '5',
      maxItems: '5',
      description: 'Presne 5 železných pravidiel pokrývajúcich Produkt & UX, Financie a Prevádzku.',
      items: {
        type: Type.OBJECT,
        properties: {
          rule: { type: Type.STRING },
          category: {
            type: Type.STRING,
            description: 'Produkt & UX, Financie alebo Prevádzka',
          },
          rationale: { type: Type.STRING },
        },
        required: ['rule', 'category', 'rationale'],
      },
    },
    scalingPlaybook: {
      type: Type.ARRAY,
      minItems: '3',
      maxItems: '3',
      description: 'Presne 3 fázy škálovania: 100 používateľov, 1 000 používateľov, 10 000 používateľov.',
      items: {
        type: Type.OBJECT,
        properties: {
          stage: { type: Type.STRING },
          focus: { type: Type.STRING },
          feedbackLoop: { type: Type.STRING },
          retentionMechanic: { type: Type.STRING },
          viralLoop: { type: Type.STRING },
          bottleneckFix: { type: Type.STRING },
        },
        required: [
          'stage',
          'focus',
          'feedbackLoop',
          'retentionMechanic',
          'viralLoop',
          'bottleneckFix',
        ],
      },
    },
  },
  required: ['fatalMistakes', 'ironRules', 'scalingPlaybook'],
};

export const fullBlueprintSchema: Schema = {
  type: Type.OBJECT,
  description:
    'Kompletný 5-sekciový produktový plán (promoKit -> promo, roadmap, techArchitecture -> tech, marketingPlan -> marketing, antiFailAndScaling -> antifail).',
  properties: {
    promo: promoSchema,
    roadmap: roadmapSchema,
    tech: techSchema,
    marketing: marketingSchema,
    antifail: antifailSchema,
  },
  required: ['promo', 'roadmap', 'tech', 'marketing', 'antifail'],
};

export const SYSTEM_INSTRUCTION = `Si špičkový slovenský produktový architekt, technický riaditeľ (CTO) a rastový stratég.
Tvojou úlohou je premeniť používateľov nápad na realistický, konkrétny a okamžite použiteľný produktový plán v prirodzenej, plynulej a profesionálnej slovenčine.
Pravidlá:
1. Všetky texty, názvy fáz, úlohy, marketingové príspevky, vysvetlenia aj odhady píš po slovensky (štandardné technické termíny ako PostgreSQL, Next.js, REST API ponechaj v zaužívanej podobe).
2. Buď maximálne konkrétny k zadanému nápadu, rozpočtu, cieľovej skupine a typu projektu — vyhni sa všeobecným frázam a prázdnym marketingovým klišé.
3. V sekcii promo vráť presne 3 promo príspevky (LinkedIn, Instagram / TikTok, Product Hunt) a presne 3 farby značky s platným HEX kódom.
4. V sekcii roadmap vráť presne 3 fázy ("Fáza 1: Validácia", "Fáza 2: MVP", "Fáza 3: Finálny produkt"), každú s 3 až 6 konkrétnymi úlohami, unikátnym ID (napr. "p1_1") a "done": false.
5. V sekcii marketing vráť 2 až 3 cenové balíky v EUR (€), minimálne 4 kroky v first30DaysChecklist (s "done": false) a 3 akvizičné kanály.
6. V sekcii antifail vráť PRESNE 5 konkrétnych kritických chýb (fatalMistakes), PRESNE 5 železných pravidiel (ironRules) a PRESNE 3 etapy škálovania ("100 používateľov", "1 000 používateľov", "10 000 používateľov").
7. Ceny a náklady vždy uvádzaj v EUR (€).`;

function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

function asRecord(val: unknown): Record<string, unknown> | null {
  return typeof val === 'object' && val !== null && !Array.isArray(val)
    ? (val as Record<string, unknown>)
    : null;
}

export function validatePromoSection(raw: unknown): string | null {
  const data = asRecord(raw);
  if (!data) return 'Sekcia promo chýba alebo nie je objekt.';
  if (!isNonEmptyString(data.projectName)) return 'promo.projectName nesmie byť prázdne.';
  if (!isNonEmptyString(data.tagline)) return 'promo.tagline nesmie byť prázdne.';
  if (!isNonEmptyString(data.elevatorPitch)) return 'promo.elevatorPitch nesmie byť prázdne.';
  if (!isNonEmptyString(data.valueProposition)) return 'promo.valueProposition nesmie byť prázdne.';

  const hero = asRecord(data.heroCopy);
  if (!hero || !isNonEmptyString(hero.headline) || !isNonEmptyString(hero.subheadline) || !isNonEmptyString(hero.cta)) {
    return 'promo.heroCopy musí obsahovať headline, subheadline a cta.';
  }

  if (!Array.isArray(data.promoPosts) || data.promoPosts.length !== 3) {
    return 'promo.promoPosts musí obsahovať presne 3 príspevky.';
  }
  for (const post of data.promoPosts) {
    const p = asRecord(post);
    if (!p || !isNonEmptyString(p.platform) || !isNonEmptyString(p.title) || !isNonEmptyString(p.content)) {
      return 'Každý promo príspevok musí mať platform, title a content.';
    }
  }

  const brand = asRecord(data.brandDirection);
  if (!brand || !isNonEmptyString(brand.toneOfVoice) || !Array.isArray(brand.colors) || brand.colors.length !== 3) {
    return 'promo.brandDirection musí obsahovať toneOfVoice a presne 3 farby.';
  }
  for (const color of brand.colors) {
    const c = asRecord(color);
    if (!c || !isNonEmptyString(c.name) || !isNonEmptyString(c.hex) || !isNonEmptyString(c.usage)) {
      return 'Každá farba značky musí obsahovať name, hex a usage.';
    }
  }
  return null;
}

export function validateRoadmapSection(raw: unknown): string | null {
  const data = asRecord(raw);
  if (!data || !Array.isArray(data.phases) || data.phases.length !== 3) {
    return 'roadmap.phases musí obsahovať presne 3 fázy.';
  }
  for (const phase of data.phases) {
    const ph = asRecord(phase);
    if (!ph || typeof ph.phaseNumber !== 'number' || !isNonEmptyString(ph.title) || !isNonEmptyString(ph.duration) || !isNonEmptyString(ph.goal)) {
      return 'Každá fáza roadmapy musí mať phaseNumber, title, duration a goal.';
    }
    if (!Array.isArray(ph.items) || ph.items.length < 3) {
      return `Fáza "${ph.title}" musí obsahovať aspoň 3 akčné úlohy.`;
    }
    for (const item of ph.items) {
      const it = asRecord(item);
      if (!it || !isNonEmptyString(it.id) || !isNonEmptyString(it.text) || typeof it.done !== 'boolean') {
        return 'Každá úloha roadmapy musí mať id, text a done (boolean).';
      }
    }
  }
  return null;
}

export function validateTechSection(raw: unknown): string | null {
  const data = asRecord(raw);
  if (!data) return 'Sekcia tech chýba.';
  const stack = asRecord(data.stack);
  if (!stack) return 'tech.stack chýba.';
  for (const key of ['frontend', 'backend', 'database', 'auth', 'hosting']) {
    const item = asRecord(stack[key]);
    if (!item || !isNonEmptyString(item.name) || !isNonEmptyString(item.reason)) {
      return `tech.stack.${key} musí obsahovať name a reason.`;
    }
  }
  if (!Array.isArray(data.dataModel) || data.dataModel.length < 3) {
    return 'tech.dataModel musí obsahovať aspoň 3 entity.';
  }
  for (const ent of data.dataModel) {
    const e = asRecord(ent);
    if (!e || !isNonEmptyString(e.entity) || !isNonEmptyString(e.description) || !Array.isArray(e.fields) || e.fields.length < 2) {
      return 'Každá entita v tech.dataModel musí mať názov, opis a aspoň 2 polia.';
    }
  }
  if (!Array.isArray(data.apiEndpoints) || data.apiEndpoints.length < 3) {
    return 'tech.apiEndpoints musí obsahovať aspoň 3 endpointy.';
  }
  if (!Array.isArray(data.integrations) || data.integrations.length < 2) {
    return 'tech.integrations musí obsahovať aspoň 2 integrácie.';
  }
  if (!Array.isArray(data.securityNotes) || data.securityNotes.length < 2) {
    return 'tech.securityNotes musí obsahovať aspoň 2 poznámky.';
  }
  const cost = asRecord(data.mvpCostEstimate);
  if (!cost || !isNonEmptyString(cost.monthlyEstimate) || !isNonEmptyString(cost.breakdown)) {
    return 'tech.mvpCostEstimate musí obsahovať monthlyEstimate a breakdown.';
  }
  return null;
}

export function validateMarketingSection(raw: unknown): string | null {
  const data = asRecord(raw);
  if (!data) return 'Sekcia marketing chýba.';
  if (!isNonEmptyString(data.monetizationStrategy)) {
    return 'marketing.monetizationStrategy nesmie byť prázdne.';
  }
  if (!Array.isArray(data.pricingTiers) || data.pricingTiers.length < 2) {
    return 'marketing.pricingTiers musí obsahovať aspoň 2 cenové balíky.';
  }
  if (!Array.isArray(data.first30DaysChecklist) || data.first30DaysChecklist.length < 4) {
    return 'marketing.first30DaysChecklist musí obsahovať aspoň 4 úlohy.';
  }
  for (const t of data.first30DaysChecklist) {
    const task = asRecord(t);
    if (!task || !isNonEmptyString(task.id) || !isNonEmptyString(task.week) || !isNonEmptyString(task.task) || typeof task.done !== 'boolean') {
      return 'Každá úloha v first30DaysChecklist musí mať id, week, task a done.';
    }
  }
  if (!Array.isArray(data.acquisitionChannels) || data.acquisitionChannels.length < 3) {
    return 'marketing.acquisitionChannels musí obsahovať aspoň 3 kanály.';
  }
  if (!Array.isArray(data.northStarMetrics) || data.northStarMetrics.length < 2) {
    return 'marketing.northStarMetrics musí obsahovať aspoň 2 metriky.';
  }
  return null;
}

export function validateAntiFailSection(raw: unknown): string | null {
  const data = asRecord(raw);
  if (!data) return 'Sekcia antifail chýba.';
  if (!Array.isArray(data.fatalMistakes) || data.fatalMistakes.length !== 5) {
    return 'antifail.fatalMistakes musí obsahovať presne 5 kritických chýb.';
  }
  for (const m of data.fatalMistakes) {
    const mistake = asRecord(m);
    if (!mistake || !isNonEmptyString(mistake.title) || !isNonEmptyString(mistake.mistake) || !isNonEmptyString(mistake.prevention)) {
      return 'Každá chyba v antifail.fatalMistakes musí mať title, mistake a prevention.';
    }
  }
  if (!Array.isArray(data.ironRules) || data.ironRules.length !== 5) {
    return 'antifail.ironRules musí obsahovať presne 5 železných pravidiel.';
  }
  for (const r of data.ironRules) {
    const rule = asRecord(r);
    if (!rule || !isNonEmptyString(rule.rule) || !isNonEmptyString(rule.category) || !isNonEmptyString(rule.rationale)) {
      return 'Každé pravidlo v antifail.ironRules musí mať rule, category a rationale.';
    }
  }
  if (!Array.isArray(data.scalingPlaybook) || data.scalingPlaybook.length !== 3) {
    return 'antifail.scalingPlaybook musí obsahovať presne 3 etapy škálovania.';
  }
  for (const s of data.scalingPlaybook) {
    const stage = asRecord(s);
    if (
      !stage ||
      !isNonEmptyString(stage.stage) ||
      !isNonEmptyString(stage.focus) ||
      !isNonEmptyString(stage.feedbackLoop) ||
      !isNonEmptyString(stage.retentionMechanic) ||
      !isNonEmptyString(stage.viralLoop) ||
      !isNonEmptyString(stage.bottleneckFix)
    ) {
      return 'Každá etapa v antifail.scalingPlaybook musí mať vyplnené všetky polia.';
    }
  }
  return null;
}

export type SectionKey = 'promo' | 'roadmap' | 'tech' | 'marketing' | 'antifail';

export function validateSectionData(tabKey: SectionKey, raw: unknown): string | null {
  switch (tabKey) {
    case 'promo':
      return validatePromoSection(raw);
    case 'roadmap':
      return validateRoadmapSection(raw);
    case 'tech':
      return validateTechSection(raw);
    case 'marketing':
      return validateMarketingSection(raw);
    case 'antifail':
      return validateAntiFailSection(raw);
  }
}

export function validateBlueprint(raw: unknown): string | null {
  const bp = asRecord(raw);
  if (!bp) return 'Výstup nie je platný JSON objekt.';
  return (
    validatePromoSection(bp.promo) ||
    validateRoadmapSection(bp.roadmap) ||
    validateTechSection(bp.tech) ||
    validateMarketingSection(bp.marketing) ||
    validateAntiFailSection(bp.antifail)
  );
}

export function parseJsonResponse(rawText: string | undefined): unknown {
  const cleaned = (rawText ?? '')
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  if (!cleaned) {
    throw new Error('VALIDATION_EMPTY_RESPONSE');
  }
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('VALIDATION_INVALID_JSON');
  }
}

function formatAiError(err: unknown): { status: number; message: string; code?: number } {
  const raw = err instanceof Error ? err.message : String(err);
  const apiStatus =
    typeof err === 'object' && err !== null && 'status' in err
      ? Number((err as { status?: unknown }).status)
      : undefined;

  if (raw.startsWith('VALIDATION_')) {
    return {
      status: 502,
      code: 502,
      message:
        'AI model vrátil nekompletnú štruktúru návrhu ani po automatickom opakovaní. Kliknite na „Skúsiť znova“.',
    };
  }
  if (
    apiStatus === 403 ||
    raw.includes('API_KEY_INVALID') ||
    raw.includes('PERMISSION_DENIED') ||
    raw.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT')
  ) {
    return {
      status: 403,
      code: 403,
      message:
        'Prístup k Gemini API bol zamietnutý. Skontrolujte prosím API kľúč v paneli Settings > Secrets.',
    };
  }
  if (apiStatus === 429 || raw.includes('RESOURCE_EXHAUSTED')) {
    return {
      status: 429,
      code: 429,
      message:
        'Limit požiadaviek na Gemini API bol dočasne vyčerpaný. Skúste to prosím o chvíľu znova.',
    };
  }
  if (apiStatus === 404 || raw.includes('NOT_FOUND')) {
    return {
      status: 502,
      code: 404,
      message: 'Požadovaný AI model momentálne nie je dostupný. Skúste to znova o chvíľu.',
    };
  }
  if (apiStatus === 400 || raw.includes('INVALID_ARGUMENT')) {
    return {
      status: 400,
      code: 400,
      message: 'Neplatná požiadavka pre AI model. Skúste upraviť opis nápadu a odoslať znova.',
    };
  }
  if (apiStatus === 503 || raw.includes('UNAVAILABLE')) {
    return {
      status: 503,
      code: 503,
      message:
        'AI model je momentálne dočasne preťažený. Kliknite na „Skúsiť znova“ o pár sekúnd.',
    };
  }
  return {
    status: 500,
    code: apiStatus ?? 500,
    message: 'Pri generovaní návrhu nastala chyba na strane servera. Kliknite na „Skúsiť znova“.',
  };
}

async function callGeminiWithTransientRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI['models']['generateContent']>[0],
  attempts = 2
) {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err) {
      lastErr = err;
      const status =
        typeof err === 'object' && err !== null && 'status' in err
          ? Number((err as { status?: unknown }).status)
          : undefined;
      const msg = err instanceof Error ? err.message : String(err);
      const isTransient = status === 503 || msg.includes('UNAVAILABLE');
      if (!isTransient || i === attempts - 1) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, 900 * Math.pow(2, i)));
    }
  }
  throw lastErr;
}

async function generateValidatedJson<T>(
  ai: GoogleGenAI,
  basePrompt: string,
  schema: Schema,
  maxOutputTokens: number,
  validate: (data: unknown) => string | null
): Promise<T> {
  let prompt = basePrompt;
  let lastValidationReason = '';

  // Initial attempt + 1 automatic retry if JSON parsing or schema validation fails
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await callGeminiWithTransientRetry(ai, {
      model: MODEL_ID,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: schema,
        maxOutputTokens,
        temperature: 0.4,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      },
    });

    try {
      const parsed = parseJsonResponse(response.text);
      const validationError = validate(parsed);
      if (!validationError) {
        return parsed as T;
      }
      lastValidationReason = validationError;
    } catch (err) {
      lastValidationReason = err instanceof Error ? err.message : 'Neplatný JSON formát';
    }

    if (attempt === 0) {
      console.warn(`Structured output validation failed, retrying once: ${lastValidationReason}`);
      prompt = `${basePrompt}

DÔLEŽITÉ UPOZORNENIE PRE OPRAVU:
Predchádzajúca odpoveď neprešla validačnou kontrolou z tohto dôvodu: ${lastValidationReason}
Vráť prosím kompletný, neprázdny JSON objekt v slovenčine presne podľa zadanej schémy vrátane všetkých požadovaných počtov položiek.`;
    }
  }

  throw new Error(`VALIDATION_FAILED: ${lastValidationReason}`);
}

export interface ApiAppOptions {
  aiClientFactory?: () => GoogleGenAI | null;
  rateLimit?: { generate: number; refine: number; windowMs?: number } | false;
}

export function createApiApp(options: ApiAppOptions = {}) {
  const app = express();
  applySecurity(app);
  app.use(express.json({ limit: '2mb' }));

  const aiClientFactory = options.aiClientFactory ?? getAiClient;
  const rateLimitConfig =
    options.rateLimit === false ? null : (options.rateLimit ?? { generate: 10, refine: 20, windowMs: 60_000 });

  async function checkRequestRateLimit(
    req: express.Request,
    res: express.Response,
    limit: number
  ): Promise<boolean> {
    if (!rateLimitConfig) return true;
    const ip = req.ip ?? 'unknown';
    const result = await checkRateLimit(ip, limit, rateLimitConfig.windowMs);
    res.setHeader('X-RateLimit-Limit', String(result.limit));
    res.setHeader('X-RateLimit-Remaining', String(result.remaining));
    if (!result.success) {
      const retryAfterSeconds = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json({
        error: 'Príliš veľa požiadaviek. Skúste to prosím o chvíľu znova.',
      });
      return false;
    }
    return true;
  }

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, hasKey: Boolean(aiClientFactory()) });
  });

  app.post('/api/generate', async (req, res) => {
    const ai = aiClientFactory();
    if (!ai) {
      res.status(503).json({
        error:
          'API kľúč pre Gemini nie je nastavený. Pridajte ho v paneli Settings > Secrets a skúste znova.',
      });
      return;
    }

    const parsed = validateGenerateBody(req.body);
    if ('error' in parsed) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const { idea, targetAudience, budget, projectType } = parsed.value;

    if (rateLimitConfig && !(await checkRequestRateLimit(req, res, rateLimitConfig.generate))) {
      return;
    }

    const prompt = `Vypracuj kompletnú architektúru produktu pre tento nápad:
- Nápad: ${idea}
- Typ projektu: ${projectType}
- Rozpočet: ${budget}
- Cieľová skupina: ${targetAudience}

Prispôsob technický stack, rozpočtové odhady v EUR, realizačný plán, marketingovú stratégiu, 5 kritických chýb, 5 železných pravidiel a 3 etapy škálovania (100 → 1 000 → 10 000 používateľov) presne uvedenému rozpočtu (${budget}) a typu projektu (${projectType}).`;

    try {
      const blueprint = await generateValidatedJson(
        ai,
        prompt,
        fullBlueprintSchema,
        16384,
        validateBlueprint
      );
      res.json({ blueprint });
    } catch (err) {
      console.error('Gemini /api/generate error:', err);
      const formatted = formatAiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  app.post('/api/refine', async (req, res) => {
    const ai = aiClientFactory();
    if (!ai) {
      res.status(503).json({
        error:
          'API kľúč pre Gemini nie je nastavený. Pridajte ho v paneli Settings > Secrets a skúste znova.',
      });
      return;
    }

    const parsed = validateRefineBody(req.body);
    if ('error' in parsed) {
      res.status(400).json({ error: parsed.error });
      return;
    }
    const { tabKey, instruction, project } = parsed.value;

    if (rateLimitConfig && !(await checkRequestRateLimit(req, res, rateLimitConfig.refine))) {
      return;
    }

    const schemaMap: Record<SectionKey, Schema> = {
      promo: promoSchema,
      roadmap: roadmapSchema,
      tech: techSchema,
      marketing: marketingSchema,
      antifail: antifailSchema,
    };

    const targetSchema = schemaMap[tabKey as SectionKey];
    if (!targetSchema) {
      res.status(400).json({
        error: 'Neplatná sekcia na úpravu.',
      });
      return;
    }

    const prompt = `Používateľ chce upraviť alebo rozpracovať výhradne sekciu "${tabKey}" existujúceho projektu "${project.title}".
Pôvodný nápad: ${String(project.input?.idea ?? '')}
Typ: ${String(project.input?.projectType ?? '')}, Rozpočet: ${String(project.input?.budget ?? '')}, Cieľovka: ${String(project.input?.targetAudience ?? '')}

Aktuálny obsah sekcie "${tabKey}":
${JSON.stringify(project.blueprint?.[tabKey] ?? {}, null, 2)}

Požiadavka používateľa na úpravu tejto sekcie:
"${instruction}"

Vráť upravený kompletný JSON objekt iba pre sekciu "${tabKey}" v slovenčine, pri zachovaní všetkých požadovaných polí a počtov položiek.`;

    try {
      const updatedSection = await generateValidatedJson(
        ai,
        prompt,
        targetSchema,
        8192,
        (data) => validateSectionData(tabKey, data)
      );
      res.json({ tabKey, sectionData: updatedSection });
    } catch (err) {
      console.error('Gemini /api/refine error:', err);
      const formatted = formatAiError(err);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  return app;
}
