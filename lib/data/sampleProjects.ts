import type { SavedProject } from '../types';

export interface IdeaExampleChip {
  label: string;
  idea: string;
  targetAudience: string;
  budget: 'Nízky' | 'Stredný' | 'Startup';
  projectType: 'SaaS' | 'Mobilná appka' | 'E-commerce' | 'Služba';
}

export const IDEA_EXAMPLES: IdeaExampleChip[] = [
  {
    label: 'B2B trh pre lokálne farmy',
    idea: 'B2B digitálne trhovisko, ktoré priamo prepája malé slovenské rodinné farmy a pestovateľov s lokálnymi reštauráciami a bistrami bez zbytočných veľkoobchodných marží.',
    targetAudience: 'Lokálne reštaurácie, bistrá a malí farmári na Slovensku',
    budget: 'Stredný',
    projectType: 'SaaS',
  },
  {
    label: 'AI daňový strážca pre SZČO',
    idea: 'Mobilná aplikácia pre slovenských živnostníkov a freelancerov, ktorá automaticky sleduje limity obratu pre DPH, odhaduje odvody do Sociálnej a zdravotnej poisťovne a upozorňuje na termíny.',
    targetAudience: 'Slovenskí živnostníci (SZČO) a freelanceri',
    budget: 'Nízky',
    projectType: 'Mobilná appka',
  },
  {
    label: 'Predplatné remeselnej kávy',
    idea: 'Personalizovaný e-shop s mesačným predplatným čerstvo praženej výberovej kávy zo slovenských a českých pražiarní podľa chuťového profilu zákazníka.',
    targetAudience: 'Milovníci výberovej kávy a domáci baristi',
    budget: 'Nízky',
    projectType: 'E-commerce',
  },
];

export const SAMPLE_PROJECT: SavedProject = {
  id: 'proj_sample_lokalny_trh',
  title: 'Zelený Pult',
  createdAt: '2026-11-10T09:00:00.000Z',
  updatedAt: '2026-11-10T09:00:00.000Z',
  providerUsed: 'Gemini 3.8 Flash',
  input: {
    idea: IDEA_EXAMPLES[0].idea,
    targetAudience: IDEA_EXAMPLES[0].targetAudience,
    budget: IDEA_EXAMPLES[0].budget,
    projectType: IDEA_EXAMPLES[0].projectType,
    modelId: 'gemini-fast',
  },
  blueprint: {
    promoKit: {
      name: 'Zelený Pult',
      tagline: 'Čerstvá úroda zo slovenských fariem priamo do vašej kuchyne do 24 hodín.',
      elevatorPitch:
        'Zelený Pult eliminuje neprehľadné veľkoobchodné reťazce a spája šéfkuchárov priamo s overenými lokálnymi farmármi. Reštaurácie získajú čerstvejšie suroviny s jasným pôvodom a farmári férovú cenu bez sprostredkovateľských marží.',
      valueProposition:
        'Jednotný B2B objednávkový portál so zaručeným ranným závozom, konsolidovanou fakturáciou a sezónnym plánovaním úrody.',
      heroCopy: {
        headline: 'Objednávajte lokálne suroviny za 90 sekúnd, nie za dve hodiny telefonátov',
        subheadline:
          'Prehľadný katalóg sezónnej zeleniny, mliečnych výrobkov a mäsa od 40+ slovenských fariem s jednou mesačnou faktúrou.',
        cta: 'Vyskúšať prvý závoz zadarmo',
      },
      promoPosts: [
        {
          platform: 'LinkedIn',
          title: 'Príbeh problému a riešenia pre gastro sektor',
          content:
            'Každý šéfkuchár pozná nedeľný večer: 6 telefonátov rôznym dodávateľom, neistá kvalita a roztrúsené faktúry.\n\nPreto spúšťame Zelený Pult – B2B platformu, kde slovenské bistrá objednajú čerstvé suroviny priamo od farmárov na jedno kliknutie.\n\n✅ Transparentný pôvod surovín\n✅ Ranný závoz priamo do prevádzky\n✅ Jedna súhrnná faktúra\n\nHľadáme prvých 10 prevádzok v Bratislave a okolí na bezplatný pilot. Napíšte nám do správy.',
        },
        {
          platform: 'Instagram / TikTok',
          title: 'Krátky video scenár (Reels / TikTok 25 sekúnd)',
          content:
            '[0:00-0:04] Záber na šéfkuchára krájajúceho čerstvé paradajky: „Vieš, prečo toto jedlo chutí inak?“\n[0:05-0:12] Strih na farmára v skleníku o 6:00 ráno: „Ešte pred svitaním boli na koreni v Trnave.“\n[0:13-0:20] Ukážka mobilu s aplikáciou Zelený Pult: „Žiadne sklady na tri týždne. Objednáš večer, varíš ráno.“\n[0:21-0:25] Výzva: „Prevádzkuješ gastro? Link na pilotný závoz je v profile.“',
        },
        {
          platform: 'Product Hunt',
          title: 'Krátke predstavenie produktu',
          content:
            'Zelený Pult je moderné B2B trhovisko pre krátke potravinové reťazce. Spájame nezávislé reštaurácie s regionálnymi farmármi pomocou predikcie sezónnych zásob, konsolidovanej logistiky a okamžitej digitálnej fakturácie.',
        },
      ],
      brandPalette: {
        toneOfVoice: 'Vecne sebavedomý, poctivý, partner pre profesionálov v gastronómii bez zbytočného pátosu.',
        colors: [
          {
            name: 'Lesná bridlica',
            hex: '#14532D',
            usage: 'Primárne CTA tlačidlá, hlavičky a akcenty dôveryhodnosti.',
          },
          {
            name: 'Teplý vápenec',
            hex: '#F7F7F5',
            usage: 'Dominantné čisté pozadie katalógu a objednávkových kariet.',
          },
          {
            name: 'Jantárová úroda',
            hex: '#D97706',
            usage: 'Upozornenia na sezónne novinky a uzávierku objednávok.',
          },
        ],
      },
    },
    roadmap: {
      phases: [
        {
          phaseNumber: 1,
          title: 'Fáza 1: Validácia',
          duration: '1. – 3. týždeň',
          goal: 'Potvrdiť reálny dopyt u 10 šéfkuchárov a ochotu 5 fariem dodávať cez jednotný proces.',
          items: [
            {
              id: 'val_1',
              text: 'Uskutočniť 15 osobných rozhovorov s majiteľmi a šéfkuchármi lokálnych bistier',
              done: true,
            },
            {
              id: 'val_2',
              text: 'Overiť u 5 regionálnych farmárov ich týždenné kapacity a balenie',
              done: false,
            },
            {
              id: 'val_3',
              text: 'Zrealizovať 3 manuálne „Concierge“ závozy cez zdieľanú Google tabuľku a dodávku',
              done: false,
            },
          ],
        },
        {
          phaseNumber: 2,
          title: 'Fáza 2: MVP',
          duration: '4. – 8. týždeň',
          goal: 'Spustiť samoobslužný B2B portál pre opakované týždenné objednávky a fakturáciu.',
          items: [
            {
              id: 'mvp_1',
              text: 'Nasadiť katalóg produktov s aktualizáciou skladových zásob farmárov v reálnom čase',
              done: false,
            },
            {
              id: 'mvp_2',
              text: 'Implementovať košík s uzávierkou objednávok o 18:00 pre ranný závoz',
              done: false,
            },
            {
              id: 'mvp_3',
              text: 'Napojiť automatické generovanie dodacích listov a súhrnných faktúr (SuperFaktúra)',
              done: false,
            },
            {
              id: 'mvp_4',
              text: 'Onboarding prvých 15 platiacich reštaurácií v jednom meste',
              done: false,
            },
          ],
        },
        {
          phaseNumber: 3,
          title: 'Fáza 3: Finálny produkt',
          duration: '3. – 6. mesiac',
          goal: 'Automatizovať logistiku, predikciu úrody a rozšíriť platformu do ďalších krajov.',
          items: [
            {
              id: 'fin_1',
              text: 'Optimalizácia rozvozových trás pre vodičov s mobilnou appkou na potvrdenie prebratia',
              done: false,
            },
            {
              id: 'fin_2',
              text: 'Sezónny kalendár predkontraktovanej úrody na 3 mesiace dopredu',
              done: false,
            },
            {
              id: 'fin_3',
              text: 'Automatické párovanie B2B platieb a kreditné limity pre overené prevádzky',
              done: false,
            },
          ],
        },
      ],
    },
    techArchitecture: {
      stack: {
        frontend: {
          name: 'Next.js (App Router) + Tailwind CSS',
          reason: 'Rýchly katalóg, Server Components a skvelá podpora PWA na mobile v kuchyni.',
        },
        backend: {
          name: 'Next.js Server Actions + Node.js Route Handlers',
          reason: 'Jednotné TypeScript typy medzi košíkom, fakturáciou a rozvozovým rozvrhom.',
        },
        database: {
          name: 'PostgreSQL (Supabase / Neon)',
          reason: 'ACID transakcie sú nevyhnutné pri odpočítavaní obmedzených skladových zásob farmárov.',
        },
        auth: {
          name: 'Magic Link + B2B role (Supabase Auth)',
          reason: 'Šéfkuchári si v zhone nemusia pamätať heslá; stačí rýchle prihlásenie e-mailom.',
        },
        hosting: {
          name: 'Vercel + Cloudflare CDN',
          reason: 'Nulová správa serverov v úvode a okamžité škálovanie pri ranných špičkách.',
        },
      },
      dataModel: [
        {
          entity: 'farms',
          description: 'Registrovaní pestovatelia a výrobcovia',
          fields: [
            { name: 'id', type: 'uuid', note: 'PK' },
            { name: 'company_name', type: 'text', note: 'Názov farmy / IČO' },
            { name: 'region', type: 'text', note: 'Kraj pôvodu' },
            { name: 'cutoff_hour', type: 'int', note: 'Hodina uzávierky' },
          ],
        },
        {
          entity: 'products',
          description: 'Sezónna ponuka surovín s aktuálnym množstvom',
          fields: [
            { name: 'id', type: 'uuid', note: 'PK' },
            { name: 'farm_id', type: 'uuid', note: 'FK -> farms.id' },
            { name: 'name', type: 'text' },
            { name: 'unit_price_cents', type: 'int', note: 'Cena bez DPH v centoch' },
            { name: 'available_qty', type: 'numeric' },
          ],
        },
        {
          entity: 'orders',
          description: 'Konsolidované B2B objednávky reštaurácií',
          fields: [
            { name: 'id', type: 'uuid', note: 'PK' },
            { name: 'restaurant_id', type: 'uuid', note: 'FK -> users.id' },
            { name: 'delivery_date', type: 'date' },
            { name: 'status', type: 'text', note: 'draft | confirmed | delivered' },
            { name: 'total_cents', type: 'int' },
          ],
        },
      ],
      apiEndpoints: [
        {
          method: 'GET',
          path: '/api/v1/catalog/today',
          purpose: 'Načíta dostupné sezónne suroviny pre najbližší závozový deň.',
        },
        {
          method: 'POST',
          path: '/api/v1/orders',
          purpose: 'Atomicky vytvorí objednávku a rezervuje zásoby u vybraných fariem.',
        },
        {
          method: 'GET',
          path: '/api/v1/routes/manifest',
          purpose: 'Vygeneruje zberný zoznam pre ranného šoféra podľa zón.',
        },
        {
          method: 'POST',
          path: '/api/v1/invoices/sync',
          purpose: 'Odošle dodané položky do fakturačného systému po potvrdení závozu.',
        },
      ],
      integrations: [
        { name: 'SuperFaktúra / iDoklad API', purpose: 'Automatické vystavovanie B2B faktúr a dobropisov.' },
        { name: 'Stripe / GoPay', purpose: 'Platba kartou pre menšie prevádzky a rýchle vyrovnanie.' },
        { name: 'Resend + SMS brána', purpose: 'Ranné notifikácie o čase príchodu kuriéra.' },
      ],
      securityNotes: [
        'Row-Level Security (RLS) pre striktné oddelenie cien a faktúr medzi jednotlivými prevádzkami.',
        'Idempotentné spracovanie objednávok, aby dvojité kliknutie v kuchyni nevytvorilo duplicitný závoz.',
      ],
      mvpCostEstimate: {
        monthlyEstimate: '45 € – 95 € / mesiac',
        breakdown: 'Hosting a databáza na starter tarifoch (~30 €), transakčné e-maily a SMS (~20 €), fakturačné API (~15 €).',
      },
    },
    marketingPlan: {
      monetizationStrategy:
        'Kombinácia 8 % transakčnej provízie z objemu predaja fariem a voliteľného mesačného paušálu pre reštaurácie za garantovanú dopravu zadarmo.',
      pricingTiers: [
        {
          name: 'Základ (Pre farmy)',
          price: '8 % z objednávky',
          target: 'Malí pestovatelia bez vlastného rozvozu',
          features: ['Digitálny katalóg bez fixného poplatku', 'Zber úrody naším kuriérom', 'Výplata do 7 dní'],
        },
        {
          name: 'Bistro Partner',
          price: '39 € / mesiac',
          target: 'Aktívne prevádzky s 3+ závozmi týždenne',
          features: ['Doprava zadarmo bez minimálnej hodnoty', 'Súhrnná mesačná faktúra', 'Prednostná rezervácia limitiek'],
        },
      ],
      first30DaysChecklist: [
        {
          id: 'mkt_1',
          week: '1. týždeň',
          task: 'Osobne doručiť degustačnú debničku do 10 vybraných výberových bistier',
          done: false,
        },
        {
          id: 'mkt_2',
          week: '2. týždeň',
          task: 'Spustiť jednoduchú landing page s týždenným cenníkom a formulárom na pilot',
          done: false,
        },
        {
          id: 'mkt_3',
          week: '3. týždeň',
          task: 'Získať 3 video referencie od spokojných šéfkuchárov priamo z prípravy menu',
          done: false,
        },
        {
          id: 'mkt_4',
          week: '4. týždeň',
          task: 'Spustiť odporúčací program: 50 € kredit za odporučenie spriatelenej prevádzky',
          done: false,
        },
      ],
      acquisitionChannels: [
        {
          channel: 'Priamy terénny predaj (Door-to-door)',
          tactic: 'Návšteva prevádzok medzi 14:00 a 16:30 mimo obednej špičky s reálnou vzorkou surovín.',
          expectedImpact: 'Prvých 25 – 35 aktívnych kuchýň s najvyššou konverziou.',
        },
        {
          channel: 'Gastro komunity & LinkedIn',
          tactic: 'Pravidelné týždenné reporty „Čo je práve v sezóne“ s cenami a fotografiami z fariem.',
          expectedImpact: '30 – 40 inbound registrácií mesačne.',
        },
        {
          channel: 'Odporúčania kuchár -> kuchár',
          tactic: 'Kredity na nákup za každého privedeného kolegu z inej reštaurácie.',
          expectedImpact: 'Stabilný organický rast na 100+ prevádzok.',
        },
      ],
      northStarMetrics: [
        {
          name: 'Opakovaná týždenná objednávka',
          target: '>= 65 % aktívnych bistier',
          why: 'Potvrdzuje, že kuchyňa sa na platformu spolieha pri bežnom nákupe.',
        },
        {
          name: 'Miera bezchybného závozu (OTIF)',
          target: '>= 97 %',
          why: 'V gastronómii jedno meškanie pred otvorením znamená stratenú dôveru.',
        },
      ],
    },
    antiFailAndScaling: {
      fatalMistakes: [
        {
          title: 'Stavba vlastného skladu príliš skoro',
          mistake: 'Prenájom chladiarenského skladu a nákup zásob na sklad pred overením objemu.',
          prevention: 'Začnite modelom cross-docking: tovar ide ráno priamo z farmy do dodávky a k zákazníkovi.',
        },
        {
          title: 'Príliš široké portfólio na štarte',
          mistake: 'Snaha ponúkať 500 položiek vrátane exotického tovaru od prvého dňa.',
          prevention: 'Vyberte 25 najobrátkovejších lokálnych surovín, ktoré kuchyne kupujú každý týždeň.',
        },
        {
          title: 'Ignorovanie reklamácií v reálnom čase',
          mistake: 'Zdĺhavý e-mailový proces, keď šéfkuchár dostane poškodenú debničku.',
          prevention: 'Okamžitý kredit jedným kliknutím po nahratí fotky v aplikácii bez hádok.',
        },
        {
          title: 'Dlhé splatnosti bez kontroly cashflow',
          mistake: 'Poskytnutie 30-dňovej splatnosti novým prevádzkam, kým farmári chcú peniaze hneď.',
          prevention: 'Prvé 3 objednávky na platbu kartou alebo zálohovo, až potom mesačná fakturácia.',
        },
        {
          title: 'Zanedbanie sezónnej komunikácie',
          mistake: 'Nechávať v ponuke produkty, ktoré sa náhle minuli v dôsledku počasia.',
          prevention: 'Automatické upozornenie s ponukou náhradnej suroviny od inej farmy.',
        },
      ],
      ironRules: [
        {
          rule: 'Každý závoz musí doraziť pred 09:30 ráno.',
          category: 'Prevádzka',
          rationale: 'Kuchyňa začína prípravu obedového menu dopoludnia; neskoré doručenie ničí použiteľnosť služby.',
        },
        {
          rule: 'Objednávkový formulár musí fungovať jednou rukou na mobile do 90 sekúnd.',
          category: 'Produkt & UX',
          rationale: 'Šéfkuchári objednávajú večer po zmene v sklade alebo pri chladničke.',
        },
        {
          rule: 'Nikdy neprekračujte 14-dňovú splatnosť voči malým farmárom.',
          category: 'Financie',
          rationale: 'Spoľahlivá a rýchla výplata je hlavný dôvod, prečo vám farmári dajú najlepšiu úrodu.',
        },
        {
          rule: 'Každá položka v katalógu musí zobrazovať reálne dostupné množstvo v reálnom čase.',
          category: 'Produkt & UX',
          rationale: 'Zrušená objednávka ráno pred otvorením kuchyne znamená okamžitú stratu dôvery prevádzky.',
        },
        {
          rule: 'Udržujte minimálne 18 % hrubú maržu na každej rozvozovej zóne od prvého mesiaca.',
          category: 'Financie',
          rationale: 'Chladiarenská logistika na poslednej míli rýchlo spaľuje hotovosť pri nevýnosných trasách.',
        },
      ],
      scalingPlaybook: [
        {
          stage: '100 používateľov',
          focus: 'Hustota doručenia v jednej mestskej zóne (napr. Bratislava Staré Mesto & Ružinov).',
          feedbackLoop: 'Týždenný 5-minútový telefonát s TOP 10 kuchármi o kvalite a chýbajúcich položkách.',
          retentionMechanic: 'Funkcia „Zopakovať minulotýždňový nákup“ na 1 klik.',
          viralLoop: 'Zdieľateľné certifikáty „Varíme z lokálnych slovenských fariem“ do okna bistra a na Instagram.',
          bottleneckFix: 'Prechod z manuálnych Excelov pre kuriérov na dedikovaný rozvozový manifest.',
        },
        {
          stage: '1 000 používateľov',
          focus: 'Rozšírenie do krajských miest cez regionálne zberné uzly (cross-dock huby).',
          feedbackLoop: 'Automatické hodnotenie kvality každej dodanej položky ihneď po prevzatí.',
          retentionMechanic: 'Sezónne predplatné a garantované ceny pri zmluvnom odbere.',
          viralLoop: 'B2B odporúčací program s kreditom na suroviny pre oba subjekty.',
          bottleneckFix: 'Napojenie API priamo na ekonomické systémy hotelových sietí.',
        },
        {
          stage: '10 000 používateľov',
          focus: 'Dátová predikcia výsadby pre farmárov na základe dopytu kuchýň.',
          feedbackLoop: 'Štvrťročné plánovacie stretnutia s poľnohospodárskymi družstvami.',
          retentionMechanic: 'Vlastné finančné produkty (krátkodobé predfinancovanie osiva a balenia).',
          viralLoop: 'Verejná mapa poctivých reštaurácií pre koncových hostí.',
          bottleneckFix: 'Vlastná flotila chladiarenských vozidiel pre kľúčové trasy a partnerstvá s kuriérmi na okraji.',
        },
      ],
    },
  },
};
