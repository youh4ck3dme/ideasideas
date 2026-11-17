import type {
  AntiFailAndScalingSection,
  IdeaBlueprint,
  MarketingPlanSection,
  PromoKitSection,
  RoadmapSection,
  TechArchitectureSection,
  WorkspaceTabKey,
} from './ai/blueprint-schema';
import type { AIModelId } from './ai/providers';

export type BudgetLevel = 'Nízky' | 'Stredný' | 'Startup';
export type ProjectType = 'SaaS' | 'Mobilná appka' | 'E-commerce' | 'Služba';

export interface IdeaContextInput {
  idea: string;
  targetAudience: string;
  budget: BudgetLevel;
  projectType: ProjectType;
  modelId: AIModelId;
}

export interface SavedProject {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  input: IdeaContextInput;
  blueprint: IdeaBlueprint;
  providerUsed?: string;
}

export type {
  AntiFailAndScalingSection,
  IdeaBlueprint,
  MarketingPlanSection,
  PromoKitSection,
  RoadmapSection,
  TechArchitectureSection,
  WorkspaceTabKey,
};
