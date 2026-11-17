export type BudgetLevel = 'Nízky' | 'Stredný' | 'Startup';

export type ProjectType = 'SaaS' | 'Mobilná appka' | 'E-commerce' | 'Služba';

export type WorkspaceTabKey = 'promo' | 'roadmap' | 'tech' | 'marketing' | 'antifail';

export interface IdeaContextInput {
  idea: string;
  targetAudience: string;
  budget: BudgetLevel;
  projectType: ProjectType;
}

export interface PromoPost {
  platform: string;
  title: string;
  content: string;
}

export interface BrandColor {
  name: string;
  hex: string;
  usage: string;
}

export interface PromoSection {
  projectName: string;
  tagline: string;
  elevatorPitch: string;
  valueProposition: string;
  heroCopy: {
    headline: string;
    subheadline: string;
    cta: string;
  };
  promoPosts: PromoPost[];
  brandDirection: {
    toneOfVoice: string;
    colors: BrandColor[];
  };
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface RoadmapPhase {
  phaseNumber: number;
  title: string;
  duration: string;
  goal: string;
  items: ChecklistItem[];
}

export interface RoadmapSection {
  phases: RoadmapPhase[];
}

export interface TechStackItem {
  name: string;
  reason: string;
}

export interface DataModelField {
  name: string;
  type: string;
  note?: string;
}

export interface DataModelEntity {
  entity: string;
  description: string;
  fields: DataModelField[];
}

export interface ApiEndpoint {
  method: string;
  path: string;
  purpose: string;
}

export interface TechIntegration {
  name: string;
  purpose: string;
}

export interface TechSection {
  stack: {
    frontend: TechStackItem;
    backend: TechStackItem;
    database: TechStackItem;
    auth: TechStackItem;
    hosting: TechStackItem;
  };
  dataModel: DataModelEntity[];
  apiEndpoints: ApiEndpoint[];
  integrations: TechIntegration[];
  securityNotes: string[];
  mvpCostEstimate: {
    monthlyEstimate: string;
    breakdown: string;
  };
}

export interface PricingTier {
  name: string;
  price: string;
  target: string;
  features: string[];
}

export interface LaunchTask {
  id: string;
  week: string;
  task: string;
  done: boolean;
}

export interface AcquisitionChannel {
  channel: string;
  tactic: string;
  expectedImpact: string;
}

export interface NorthStarMetric {
  name: string;
  target: string;
  why: string;
}

export interface MarketingSection {
  monetizationStrategy: string;
  pricingTiers: PricingTier[];
  first30DaysChecklist: LaunchTask[];
  acquisitionChannels: AcquisitionChannel[];
  northStarMetrics: NorthStarMetric[];
}

export interface FatalMistake {
  title: string;
  mistake: string;
  prevention: string;
}

export interface IronRule {
  rule: string;
  category: string;
  rationale: string;
}

export interface ScalingStage {
  stage: string;
  focus: string;
  feedbackLoop: string;
  retentionMechanic: string;
  viralLoop: string;
  bottleneckFix: string;
}

export interface AntiFailSection {
  fatalMistakes: FatalMistake[];
  ironRules: IronRule[];
  scalingPlaybook: ScalingStage[];
}

export interface IdeaBlueprint {
  promo: PromoSection;
  roadmap: RoadmapSection;
  tech: TechSection;
  marketing: MarketingSection;
  antifail: AntiFailSection;
}

export interface SavedProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  input: IdeaContextInput;
  blueprint: IdeaBlueprint;
}
