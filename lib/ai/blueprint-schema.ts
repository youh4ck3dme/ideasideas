import { z } from 'zod';

export const promoKitSchema = z.object({
  name: z
    .string()
    .describe('Originálny a zapamätateľný názov projektu v slovenčine alebo medzinárodne použiteľný názov'),
  tagline: z.string().describe('Krátky úderný slogan (max 12 slov) v slovenčine'),
  elevatorPitch: z
    .string()
    .describe('Výťahový prejav v rozsahu 2-3 jasných viet v slovenčine vysvetľujúci problém a riešenie'),
  valueProposition: z
    .string()
    .describe('Hlavná hodnotová propozícia pre cieľového zákazníka v slovenčine'),
  heroCopy: z.object({
    headline: z.string().describe('Hlavný hero nadpis pre webovú stránku v slovenčine'),
    subheadline: z.string().describe('Doplňujúci podnadpis vysvetľujúci prínos v slovenčine'),
    cta: z.string().describe('Text primárneho CTA tlačidla v slovenčine'),
  }),
  promoPosts: z
    .array(
      z.object({
        platform: z.enum(['LinkedIn', 'Instagram / TikTok', 'Product Hunt']),
        title: z.string().describe('Názov alebo uhol pohľadu príspevku v slovenčine'),
        content: z.string().describe('Kompletný text príspevku alebo video scenár v slovenčine'),
      })
    )
    .length(3)
    .describe('Presne 3 promo príspevky: LinkedIn, Instagram / TikTok, Product Hunt'),
  brandPalette: z.object({
    toneOfVoice: z.string().describe('Opis tónu komunikácie značky v slovenčine'),
    colors: z
      .array(
        z.object({
          name: z.string().describe('Slovenský názov farby'),
          hex: z
            .string()
            .describe('HEX kód farby vo formáte #RRGGBB, napr. #2563EB'),
          usage: z.string().describe('Na čo sa farba v UI používa'),
        })
      )
      .length(3)
      .describe('Presne 3 odporúčané farby palety značky'),
  }),
});

export const roadmapSchema = z.object({
  phases: z
    .array(
      z.object({
        phaseNumber: z.number().int().min(1).max(3),
        title: z
          .string()
          .describe('Názov fázy (Fáza 1: Validácia, Fáza 2: MVP, Fáza 3: Finálny produkt)'),
        duration: z
          .string()
          .describe('Odhadované trvanie v slovenčine, napr. 1. – 3. týždeň'),
        goal: z.string().describe('Hlavný merateľný cieľ fázy v slovenčine'),
        items: z
          .array(
            z.object({
              id: z.string().describe('Unikátne krátke ID, napr. val_1'),
              text: z.string().describe('Konkrétna akčná úloha v slovenčine'),
              done: z.boolean().default(false),
            })
          )
          .min(3)
          .max(6)
          .describe('3 až 6 konkrétnych akčných úloh'),
      })
    )
    .length(3)
    .describe('Presne 3 fázy: Validácia, MVP, Finálny produkt'),
});

export const techArchitectureSchema = z.object({
  stack: z.object({
    frontend: z.object({
      name: z.string().describe('Odporúčaná technológia na frontend'),
      reason: z.string().describe('Dôvod výberu prispôsobený rozpočtu a typu projektu v slovenčine'),
    }),
    backend: z.object({
      name: z.string().describe('Odporúčaná technológia na backend'),
      reason: z.string().describe('Dôvod výberu v slovenčine'),
    }),
    database: z.object({
      name: z.string().describe('Odporúčaná databáza'),
      reason: z.string().describe('Dôvod výberu v slovenčine'),
    }),
    auth: z.object({
      name: z.string().describe('Autentifikácia používateľov'),
      reason: z.string().describe('Dôvod výberu v slovenčine'),
    }),
    hosting: z.object({
      name: z.string().describe('Hosting a infraštruktúra'),
      reason: z.string().describe('Dôvod výberu v slovenčine'),
    }),
  }),
  dataModel: z
    .array(
      z.object({
        entity: z.string().describe('Názov entity v snake_case'),
        description: z.string().describe('Účel entity v slovenčine'),
        fields: z
          .array(
            z.object({
              name: z.string(),
              type: z.string(),
              note: z.string().optional(),
            })
          )
          .min(2)
          .max(7),
      })
    )
    .min(3)
    .max(5)
    .describe('3 až 5 kľúčových databázových entít'),
  apiEndpoints: z
    .array(
      z.object({
        method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
        path: z.string().describe('Cesta API endpointu, napr. /api/v1/orders'),
        purpose: z.string().describe('Účel endpointu v slovenčine'),
      })
    )
    .min(3)
    .max(6)
    .describe('3 až 6 kľúčových API endpointov'),
  integrations: z
    .array(
      z.object({
        name: z.string().describe('Názov integrácie tretej strany'),
        purpose: z.string().describe('Účel integrácie v slovenčine'),
      })
    )
    .min(2)
    .max(5)
    .describe('2 až 5 integrácií tretích strán'),
  securityNotes: z
    .array(z.string())
    .min(2)
    .max(5)
    .describe('2 až 5 bezpečnostných odporúčaní v slovenčine'),
  mvpCostEstimate: z.object({
    monthlyEstimate: z.string().describe('Odhad mesačných nákladov v EUR (€)'),
    breakdown: z.string().describe('Stručný rozpis položiek v slovenčine'),
  }),
});

export const marketingPlanSchema = z.object({
  monetizationStrategy: z.string().describe('Stratégia monetizácie a cenotvorby v slovenčine'),
  pricingTiers: z
    .array(
      z.object({
        name: z.string().describe('Názov cenového balíka'),
        price: z.string().describe('Cena v EUR, napr. 29 € / mesiac'),
        target: z.string().describe('Cieľová skupina pre tento balík'),
        features: z.array(z.string()).min(2).max(5),
      })
    )
    .min(2)
    .max(3)
    .describe('2 až 3 cenové balíky v EUR'),
  first30DaysChecklist: z
    .array(
      z.object({
        id: z.string(),
        week: z.string().describe('Týždeň, napr. 1. týždeň'),
        task: z.string().describe('Konkrétny marketingový krok'),
        done: z.boolean().default(false),
      })
    )
    .min(4)
    .max(6)
    .describe('4 až 6 konkrétnych úloh na prvých 30 dní'),
  acquisitionChannels: z
    .array(
      z.object({
        channel: z.string().describe('Názov akvizičného kanála'),
        tactic: z.string().describe('Konkrétna taktika v slovenčine'),
        expectedImpact: z.string().describe('Očakávaný dopad na získanie prvých 100 používateľov'),
      })
    )
    .min(3)
    .max(4)
    .describe('3 až 4 akvizičné kanály pre prvých 100 používateľov'),
  northStarMetrics: z
    .array(
      z.object({
        name: z.string().describe('Názov North Star metriky'),
        target: z.string().describe('Cieľová hodnota'),
        why: z.string().describe('Prečo je metrika kľúčová v slovenčine'),
      })
    )
    .min(2)
    .max(4)
    .describe('2 až 4 kľúčové North Star metriky'),
});

export const antiFailAndScalingSchema = z.object({
  fatalMistakes: z
    .array(
      z.object({
        title: z.string().describe('Názov chyby'),
        mistake: z.string().describe('V čom chyba spočíva a prečo je fatálna'),
        prevention: z.string().describe('Konkrétny spôsob, ako chybe predísť'),
      })
    )
    .length(5)
    .describe('Presne 5 kritických chýb špecifických pre tento produkt a ako sa im vyhnúť'),
  ironRules: z
    .array(
      z.object({
        rule: z.string().describe('Znenie pravidla'),
        category: z.enum(['Produkt & UX', 'Financie', 'Prevádzka']),
        rationale: z.string().describe('Zdôvodnenie v slovenčine'),
      })
    )
    .length(5)
    .describe('Presne 5 železných pravidiel pokrývajúcich Produkt & UX, Financie a Prevádzku'),
  scalingPlaybook: z
    .array(
      z.object({
        stage: z.enum(['100 používateľov', '1 000 používateľov', '10 000 používateľov']),
        focus: z.string().describe('Hlavné zameranie etapy'),
        feedbackLoop: z.string().describe('Mechanizmus zberu spätnej väzby'),
        retentionMechanic: z.string().describe('Mechanizmus udržania používateľov (retencia)'),
        viralLoop: z.string().describe('Virálna alebo odporúčacia slučka'),
        bottleneckFix: z.string().describe('Riešenie hlavného úzkeho hrdla v tejto fáze'),
      })
    )
    .length(3)
    .describe('Presne 3 fázy škálovania: 100 -> 1 000 -> 10 000 používateľov'),
});

export const blueprintSchema = z.object({
  promoKit: promoKitSchema,
  roadmap: roadmapSchema,
  techArchitecture: techArchitectureSchema,
  marketingPlan: marketingPlanSchema,
  antiFailAndScaling: antiFailAndScalingSchema,
});

export type PromoKitSection = z.infer<typeof promoKitSchema>;
export type RoadmapSection = z.infer<typeof roadmapSchema>;
export type TechArchitectureSection = z.infer<typeof techArchitectureSchema>;
export type MarketingPlanSection = z.infer<typeof marketingPlanSchema>;
export type AntiFailAndScalingSection = z.infer<typeof antiFailAndScalingSchema>;
export type IdeaBlueprint = z.infer<typeof blueprintSchema>;

export type WorkspaceTabKey =
  | 'promo'
  | 'roadmap'
  | 'tech'
  | 'marketing'
  | 'antifail';
