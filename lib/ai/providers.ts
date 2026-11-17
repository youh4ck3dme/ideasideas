import { createGoogle } from '@ai-sdk/google';
import { createMistral } from '@ai-sdk/mistral';
import type { LanguageModelV1 } from 'ai';

export type AIModelId =
  | 'gemini-fast'
  | 'gemini-pro'
  | 'mistral-flagship'
  | 'mistral-fast';

export interface ModelOption {
  id: AIModelId;
  label: string;
  provider: 'Google Gemini' | 'Mistral AI';
  badge: string;
  description: string;
  isDefault?: boolean;
}

export const AI_MODELS: ModelOption[] = [
  {
    id: 'gemini-fast',
    label: 'Gemini 3.8 Flash',
    provider: 'Google Gemini',
    badge: 'Rýchly (Odporúčané)',
    description: 'Najrýchlejšia produkčná generácia, vyvážená a detailná architektúra',
    isDefault: true,
  },
  {
    id: 'gemini-pro',
    label: 'Gemini 4 Argon',
    provider: 'Google Gemini',
    badge: 'Pro Reasoning',
    description: 'Hlboké logické uvažovanie pre komplexné SaaS a technologické architektúry',
  },
  {
    id: 'mistral-flagship',
    label: 'Mistral Large 4',
    provider: 'Mistral AI',
    badge: 'EU Flagship',
    description: 'Európska suverénna vlajková loď, výborná biznis a marketingová nuansa',
  },
  {
    id: 'mistral-fast',
    label: 'Mistral Small',
    provider: 'Mistral AI',
    badge: 'EU Fast',
    description: 'Ultra-rýchly nízkonákladový európsky model pre okamžité iterácie',
  },
];

export function getGoogleApiKey(): string | undefined {
  return (
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim()
  );
}

export function getMistralApiKey(): string | undefined {
  return process.env.MISTRAL_API_KEY?.trim();
}

export function getGoogleProvider() {
  const apiKey = getGoogleApiKey();
  return createGoogle({
    apiKey,
  });
}

export function getMistralProvider() {
  const apiKey = getMistralApiKey();
  return createMistral({
    apiKey,
  });
}

export function resolveModel(modelId: AIModelId): LanguageModelV1 {
  const google = getGoogleProvider();
  const mistral = getMistralProvider();

  switch (modelId) {
    case 'gemini-fast':
      return google('gemini-3.8-flash');
    case 'gemini-pro':
      return google('gemini-4-argon');
    case 'mistral-flagship':
      // 'mistral-large-latest' or 'mistral-large-2411'
      return mistral('mistral-large-latest');
    case 'mistral-fast':
      return mistral('mistral-small-latest');
    default:
      return google('gemini-3.8-flash');
  }
}

export function getFailoverModel(primaryModelId: AIModelId): {
  model: LanguageModelV1;
  modelId: AIModelId;
  label: string;
} | null {
  const hasGoogle = Boolean(getGoogleApiKey());
  const hasMistral = Boolean(getMistralApiKey());
  const google = getGoogleProvider();
  const mistral = getMistralProvider();

  // If primary was Gemini:
  if (primaryModelId.startsWith('gemini')) {
    if (hasMistral) {
      return {
        model: mistral('mistral-large-latest'),
        modelId: 'mistral-flagship',
        label: 'Mistral Large 4',
      };
    }
    if (primaryModelId === 'gemini-pro') {
      return {
        model: google('gemini-3.8-flash'),
        modelId: 'gemini-fast',
        label: 'Gemini 3.8 Flash',
      };
    }
  }

  // If primary was Mistral:
  if (primaryModelId.startsWith('mistral')) {
    if (hasGoogle) {
      return {
        model: google('gemini-3.8-flash'),
        modelId: 'gemini-fast',
        label: 'Gemini 3.8 Flash',
      };
    }
    if (hasMistral && primaryModelId === 'mistral-flagship') {
      return {
        model: mistral('mistral-small-latest'),
        modelId: 'mistral-fast',
        label: 'Mistral Small',
      };
    }
  }

  return null;
}
