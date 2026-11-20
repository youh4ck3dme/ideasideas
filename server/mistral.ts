export const MISTRAL_MODEL = 'mistral-large-latest';
const MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions';

export function normalizeMistralKey(raw: string | undefined | null): string | null {
  const key = raw?.trim();
  if (!key || key === 'MY_MISTRAL_API_KEY') return null;
  return key;
}

export function getMistralApiKey(): string | null {
  return normalizeMistralKey(process.env.MISTRAL_API_KEY);
}

export const BLUEPRINT_JSON_SHAPE = `Vráť jeden JSON objekt (žiadny markdown) s kľúčmi promo, roadmap, tech, marketing, antifail.
promo: projectName, tagline, elevatorPitch, valueProposition, heroCopy{headline,subheadline,cta}, promoPosts[presne 3]{platform,title,content}, brandDirection{toneOfVoice, colors[presne 3]{name,hex,usage}}.
roadmap: phases[presne 3]{phaseNumber:number, title, duration, goal, items[3 až 6]{id,text,done:false}}.
tech: stack{frontend,backend,database,auth,hosting}{name,reason}, dataModel[aspoň 3]{entity,description,fields[aspoň 2]{name,type,note}}, apiEndpoints[aspoň 3]{method,path,purpose}, integrations[aspoň 2]{name,purpose}, securityNotes[aspoň 2 stringov], mvpCostEstimate{monthlyEstimate,breakdown}.
marketing: monetizationStrategy, pricingTiers[2 až 3]{name,price,target,features[string[]]}, first30DaysChecklist[aspoň 4]{id,week,task,done:false}, acquisitionChannels[aspoň 3]{channel,tactic,expectedImpact}, northStarMetrics[aspoň 2]{name,target,why}.
antifail: fatalMistakes[presne 5]{title,mistake,prevention}, ironRules[presne 5]{rule,category,rationale}, scalingPlaybook[presne 3]{stage,focus,feedbackLoop,retentionMechanic,viralLoop,bottleneckFix}.`;

export const SECTION_JSON_SHAPES: Record<string, string> = {
  promo:
    'JSON objekt sekcie promo: projectName, tagline, elevatorPitch, valueProposition, heroCopy{headline,subheadline,cta}, promoPosts[presne 3]{platform,title,content}, brandDirection{toneOfVoice, colors[presne 3]{name,hex,usage}}.',
  roadmap:
    'JSON objekt sekcie roadmap: phases[presne 3]{phaseNumber:number, title, duration, goal, items[3 až 6]{id,text,done:false}}.',
  tech:
    'JSON objekt sekcie tech: stack{frontend,backend,database,auth,hosting}{name,reason}, dataModel[aspoň 3]{entity,description,fields[aspoň 2]{name,type,note}}, apiEndpoints[aspoň 3]{method,path,purpose}, integrations[aspoň 2]{name,purpose}, securityNotes[aspoň 2 stringov], mvpCostEstimate{monthlyEstimate,breakdown}.',
  marketing:
    'JSON objekt sekcie marketing: monetizationStrategy, pricingTiers[2 až 3]{name,price,target,features[string[]]}, first30DaysChecklist[aspoň 4]{id,week,task,done:false}, acquisitionChannels[aspoň 3]{channel,tactic,expectedImpact}, northStarMetrics[aspoň 2]{name,target,why}.',
  antifail:
    'JSON objekt sekcie antifail: fatalMistakes[presne 5]{title,mistake,prevention}, ironRules[presne 5]{rule,category,rationale}, scalingPlaybook[presne 3]{stage,focus,feedbackLoop,retentionMechanic,viralLoop,bottleneckFix}.',
};

export async function callMistralJson(options: {
  apiKey: string;
  system: string;
  prompt: string;
  maxTokens: number;
  fetchImpl?: typeof fetch;
}): Promise<string> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(MISTRAL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MISTRAL_MODEL,
      temperature: 0.3,
      max_tokens: options.maxTokens,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.prompt },
      ],
    }),
    signal: AbortSignal.timeout(55_000),
  });

  const raw = await response.text();
  if (!response.ok) {
    const err = new Error(raw.slice(0, 400)) as Error & { status: number };
    err.status = response.status;
    throw err;
  }

  let content = '';
  try {
    const data = JSON.parse(raw) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    content = data.choices?.[0]?.message?.content ?? '';
  } catch {
    throw new Error('VALIDATION_INVALID_JSON');
  }
  if (!content.trim()) {
    throw new Error('VALIDATION_EMPTY_RESPONSE');
  }
  return content;
}
