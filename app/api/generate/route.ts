import { Output, streamText } from 'ai';
import { NextRequest } from 'next/server';
import { blueprintSchema } from '@/lib/ai/blueprint-schema';
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

const SYSTEM_INSTRUCTION = `Si špičkový slovenský produktový architekt, technický riaditeľ (CTO) a rastový stratég.
Tvojou úlohou je premeniť používateľov nápad na realistický, konkrétny a okamžite použiteľný produktový plán v prirodzenej, plynulej a profesionálnej slovenčine.
Pravidlá:
1. Všetky texty, názvy fáz, úlohy, marketingové príspevky, vysvetlenia aj odhady píš po slovensky (štandardné technické termíny ako PostgreSQL, Next.js, REST API ponechaj v zaužívanej podobe).
2. Buď maximálne konkrétny k zadanému nápadu, rozpočtu, cieľovej skupine a typu projektu — vyhni sa všeobecným frázam a prázdnym marketingovým klišé.
3. V sekcii promoKit vráť presne 3 promo príspevky (LinkedIn, Instagram / TikTok, Product Hunt) a presne 3 farby značky s platným HEX kódom.
4. V sekcii roadmap vráť presne 3 fázy ("Fáza 1: Validácia", "Fáza 2: MVP", "Fáza 3: Finálny produkt"), každú s 3 až 6 konkrétnymi úlohami a unikátnym ID.
5. V sekcii marketingPlan vráť 2 až 3 cenové balíky v EUR (€), aspoň 4 kroky v first30DaysChecklist a 3 akvizičné kanály pre prvých 100 používateľov.
6. V sekcii antiFailAndScaling vráť PRESNE 5 konkrétnych kritických chýb (fatalMistakes), PRESNE 5 železných pravidiel (ironRules) a PRESNE 3 etapy škálovania ("100 používateľov", "1 000 používateľov", "10 000 používateľov").
7. Ceny a náklady vždy uvádzaj v EUR (€).`;

export async function POST(req: NextRequest) {
  // IP Rate limiting
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    '127.0.0.1';

  const rateLimit = await checkRateLimit(ip, 25, 60_000);
  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({
        error:
          'Príliš veľa požiadaviek z vašej IP adresy. Počkajte prosím chvíľu a skúste znova.',
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

  const rawIdea = typeof body.idea === 'string' ? body.idea.trim() : '';
  const idea = rawIdea.slice(0, 2000); // Input sanitization: max 2000 chars
  const targetAudience =
    typeof body.targetAudience === 'string' && body.targetAudience.trim()
      ? body.targetAudience.trim().slice(0, 500)
      : 'Nešpecifikovaná (navrhni najvhodnejšiu)';
  const budget = typeof body.budget === 'string' ? body.budget : 'Nízky';
  const projectType = typeof body.projectType === 'string' ? body.projectType : 'SaaS';
  const requestedModelId: AIModelId = body.modelId || 'gemini-fast';

  if (idea.length < 10) {
    return new Response(
      JSON.stringify({
        error: 'Opíš prosím svoj nápad podrobnejšie (minimálne 10 znakov).',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const prompt = `Vypracuj kompletnú architektúru produktu pre tento nápad:
- Nápad: ${idea}
- Typ projektu: ${projectType}
- Rozpočet: ${budget}
- Cieľová skupina: ${targetAudience}

Prispôsob technický stack, rozpočtové odhady v EUR, realizačný plán, marketingovú stratégiu, 5 kritických chýb, 5 železných pravidiel a 3 etapy škálovania (100 → 1 000 → 10 000 používateľov) presne uvedenému rozpočtu (${budget}) a typu projektu (${projectType}).`;

  const hasGoogle = Boolean(getGoogleApiKey());
  const hasMistral = Boolean(getMistralApiKey());

  if (!hasGoogle && !hasMistral) {
    return new Response(
      JSON.stringify({
        error:
          'API kľúč pre Google Gemini ani Mistral AI nie je nastavený. Nastavte prosím GEMINI_API_KEY alebo MISTRAL_API_KEY v paneli Secrets.',
      }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Provider routing & automatic failover
  let activeModelId = requestedModelId;
  if (requestedModelId.startsWith('mistral') && !hasMistral && hasGoogle) {
    activeModelId = 'gemini-fast';
  } else if (requestedModelId.startsWith('gemini') && !hasGoogle && hasMistral) {
    activeModelId = 'mistral-flagship';
  }

  let model = resolveModel(activeModelId);

  try {
    const result = streamText({
      model,
      system: SYSTEM_INSTRUCTION,
      prompt,
      temperature: 0.4,
      output: Output.object({ schema: blueprintSchema }),
    });

    return result.toTextStreamResponse({
      headers: {
        'X-AI-Provider-Used': activeModelId,
      },
    });
  } catch (primaryError: any) {
    console.warn(`Primary model ${activeModelId} failed, trying failover:`, primaryError);
    const failover = getFailoverModel(activeModelId);

    if (failover) {
      try {
        const failoverResult = streamText({
          model: failover.model,
          system: SYSTEM_INSTRUCTION,
          prompt,
          temperature: 0.4,
          output: Output.object({ schema: blueprintSchema }),
        });

        return failoverResult.toTextStreamResponse({
          headers: {
            'X-AI-Provider-Used': `${failover.label} (Záložný engine)`,
          },
        });
      } catch (failoverError: any) {
        console.error('Failover also failed:', failoverError);
      }
    }

    return new Response(
      JSON.stringify({
        error:
          primaryError?.message ||
          'Pri generovaní návrhu nastala chyba na strane AI modelu. Skúste to znova.',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
