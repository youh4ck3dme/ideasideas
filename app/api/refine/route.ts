import { generateText, Output } from 'ai';
import { NextRequest } from 'next/server';
import {
  antiFailAndScalingSchema,
  marketingPlanSchema,
  promoKitSchema,
  roadmapSchema,
  techArchitectureSchema,
} from '@/lib/ai/blueprint-schema';
import {
  AIModelId,
  getFailoverModel,
  getGoogleApiKey,
  getMistralApiKey,
  resolveModel,
} from '@/lib/ai/providers';
import { checkRateLimit } from '@/lib/rate-limiter';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const schemaMap: Record<string, any> = {
  promo: promoKitSchema,
  promoKit: promoKitSchema,
  roadmap: roadmapSchema,
  tech: techArchitectureSchema,
  techArchitecture: techArchitectureSchema,
  marketing: marketingPlanSchema,
  marketingPlan: marketingPlanSchema,
  antifail: antiFailAndScalingSchema,
  antiFailAndScaling: antiFailAndScalingSchema,
};

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateLimit = await checkRateLimit(ip, 35, 60_000);
  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({
        error: 'Príliš veľa požiadaviek. Počkajte prosím chvíľu a skúste znova.',
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Neplatné telo požiadavky.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const tabKey: string = body.tabKey || '';
  const instruction: string = (body.instruction || '').trim();
  const project = body.project;
  const requestedModelId: AIModelId = body.modelId || 'gemini-fast';

  const targetSchema = schemaMap[tabKey];
  if (!targetSchema || !project || !instruction) {
    return new Response(
      JSON.stringify({ error: 'Zadaj prosím platnú inštrukciu na úpravu tejto sekcie.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const prompt = `Používateľ chce upraviť alebo rozpracovať výhradne sekciu "${tabKey}" existujúceho projektu "${project.title}".
Pôvodný nápad: ${project.input?.idea ?? ''}
Typ: ${project.input?.projectType ?? ''}, Rozpočet: ${project.input?.budget ?? ''}, Cieľovka: ${project.input?.targetAudience ?? ''}

Aktuálny obsah sekcie "${tabKey}":
${JSON.stringify(project.blueprint?.[tabKey] ?? {}, null, 2)}

Požiadavka používateľa na úpravu:
"${instruction}"

Vráť upravený kompletný JSON objekt výhradne pre sekciu "${tabKey}" v slovenčine, presne podľa zadanej schémy.`;

  const hasGoogle = Boolean(getGoogleApiKey());
  const hasMistral = Boolean(getMistralApiKey());

  if (!hasGoogle && !hasMistral) {
    return new Response(
      JSON.stringify({
        error:
          'API kľúč pre Google Gemini ani Mistral AI nie je nastavený. Nastavte prosím kľúč v paneli Secrets.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let activeModelId = !body.modelId && hasMistral ? 'mistral-flagship' : requestedModelId;
  if (requestedModelId.startsWith('mistral') && !hasMistral && hasGoogle) {
    activeModelId = 'gemini-fast';
  } else if (requestedModelId.startsWith('gemini') && !hasGoogle && hasMistral) {
    activeModelId = 'mistral-flagship';
  }

  let model = resolveModel(activeModelId);

  try {
    const result = await generateText({
      model,
      prompt,
      temperature: 0.4,
      output: Output.object({ schema: targetSchema }),
    });

    return new Response(
      JSON.stringify({
        tabKey,
        sectionData: result.output,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-AI-Provider-Used': activeModelId,
        },
      }
    );
  } catch (primaryErr: any) {
    console.warn(`Refine error on ${activeModelId}, trying failover:`, primaryErr);
    const failover = getFailoverModel(activeModelId);

    if (failover) {
      try {
        const failoverResult = await generateText({
          model: failover.model,
          prompt,
          temperature: 0.4,
          output: Output.object({ schema: targetSchema }),
        });

        return new Response(
          JSON.stringify({
            tabKey,
            sectionData: failoverResult.output,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'X-AI-Provider-Used': `${failover.label} (Záložný engine)`,
            },
          }
        );
      } catch (fbErr: any) {
        console.error('Refine failover error:', fbErr);
      }
    }

    return new Response(
      JSON.stringify({
        error:
          primaryErr?.message ||
          'Nepodarilo sa upraviť sekciu. Kliknite na Skúsiť znova.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
