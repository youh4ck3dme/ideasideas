# 🚀 PRODUKČNÝ MASTER PROMPT — Vercel deploy IdeaForge

Tento dokument je kompletný produkčný návod na deploy aplikácie na Vercel. Použi ho krok za krokom (alebo ho daj AI asistentovi ako kontext spolu s repozitárom).

---

## 1. Čo sa deployuje (architektúra na Vercel)

| Časť | Technológia | Ako na Vercel |
|---|---|---|
| Frontend | Vite + React 19 + Tailwind 4 (`src/`, build → `dist/`) | statické súbory cez `outputDirectory: "dist"` |
| API | Express app (`server/aiArchitect.ts` → `createApiApp()`) zabalené do `api/index.ts` | jedna serverless funkcia `api/index.ts` (`maxDuration: 60`) |
| Routing | `vercel.json` rewrites: `/api/*` → funkcia `/api`, všetko ostatné → `index.html` (SPA fallback) | už nakonfigurované |
| PWA | `vite-plugin-pwa` (SW `autoUpdate`, manifest `display: standalone`) | generované do `dist/` pri buildi |
| Bezpečnosť | `vercel.json` headers (CSP, nosniff, XFO, Referrer-Policy) + `server/security.ts` (trust proxy, same-origin check na /api, rate limit) | edge headers + middleware vo funkcii |

> Poznámka: adresár `app/` (Next.js) je už dokončená migrácia (`app/layout.tsx` s rovnakým viewport pravidlom, `app/page.tsx`, `app/api/*`, `app/manifest.ts`) — overené `bun run build:next`. **Deploy cieľ však zostáva Vite + `api/index.ts` funkcia** podľa `vercel.json`; Next.js varianta je pripravená, keď sa rozhodnete pre ňu prepnúť. Funkcia zálohy: používateľ môže exportovať/importovať všetky projekty ako JSON („Záloha JSON“ / „Import“ v histórii projektov).

---

## 2. Environment variables (Vercel → Project → Settings → Environment Variables, všetko **Production**)

| Premenná | Povinná | Účel |
|---|---|---|
| `GEMINI_API_KEY` | záloha | Gemini pre `/api/generate` a `/api/refine`, keď nie je `MISTRAL_API_KEY`. Obrovská response schéma na Gemini padá (`INVALID_ARGUMENT`). |
| `GOOGLE_GENERATIVE_AI_API_KEY` | voliteľné | Alternatívny názov kľúča pre Google provider (Next.js cesty v `app/api/*`). |
| `MISTRAL_API_KEY` | odporúčané | Hlavný provider Express API (`mistral-large-latest`, JSON mode bez Gemini schémy). Keď je nastavený, má prednosť pred Gemini. |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | voliteľné | Distribuovaný rate limit. Bez nich beží in-memory sliding window (per inštancia funkcie). |
| `APP_URL` | voliteľné | Verejná URL aplikácie (self-referenčné odkazy). |

Nikdy necommituj `.env` — použi Vercel Secrets / Environment Variables. Overenie, že kľúč nie je placeholder: `getAiClient()` ignoruje hodnotu `MY_GEMINI_API_KEY`.

---

## 3. Kroky deployu

```bash
# 1. Prihlásenie a prepojenie projektu
vercel login
vercel link                 # vyber tím + projekt (alebo vytvor nový)

# 2. Nastavenie env premenných (alebo cez Vercel Dashboard — odporúčané)
vercel env add GEMINI_API_KEY production
# (prípadne: GOOGLE_GENERATIVE_AI_API_KEY, MISTRAL_API_KEY, UPSTASH_...)

# 3. Production deploy z aktuálnej vetvy
vercel --prod

# Alternatíva: GitHub integration — push/merge do main spustí production build automaticky,
# každý PR dostane preview deploy.
```

Build prebehne podľa `vercel.json`: `npm run build` (Vite → `dist/`, PWA assety, `sw.js`) a `api/index.ts` sa zabalí ako serverless funkcia.

---

## 4. Bezpečnosť, ktorá je aktívna po deploy

- **Headers na edge** (`vercel.json`): `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, **CSP** (`default-src 'self'` + hash inline theme skriptu + font/connect allowlist pre Google Fonts, Gemini API, Mistral API, Upstash), `Cache-Control: no-cache` pre `sw.js`.
- **Vo funkcii** (`server/security.ts`): `trust proxy` (správne IP za Vercel proxy), rovnaké hlavičky, same-origin kontrola pre `/api/*` (cross-origin POST → 403).
- **Rate limit** (`lib/rate-limiter.ts`): `/api/generate` 10 req/min/IP, `/api/refine` 20 req/min/IP; nad limit → 429 + `Retry-After` + `X-RateLimit-*` hlavičky. S Upstash env premennými ide o globálny limit, inak in-memory fallback.
- **Serverová validácia vstupu** (`server/validateInput.ts`): idea 10–2500 znakov, whitelist rozpočtu/typu projektu, refine: platná sekcia + inštrukcia 3–500 znakov + kompletný projekt. Nevalidné → 400.
- **Egress allowlist** je otestovaný (`tests/unit/egress-allowlist.test.ts`): aplikácia komunikuje len so `fonts.googleapis.com`, `fonts.gstatic.com`, AI providermi a Upstash.

---

## 5. Post-deploy smoke test ( povinný checklist )

1. `GET https://<tvoja-domena>/api/health` → `{"ok":true,"hasKey":true,"provider":"mistral"}` (alebo `"gemini"`, ak je nastavený len `GEMINI_API_KEY`). `hasKey:false` znamená, že chýba oba kľúče.
2. **Funkčné AI**: v UI zadaj nápad (≥ 10 znakov) → „Navrhnúť architektúru" → zobrazí sa kompletný workspace so všetkými 5 sekciami; vyskúšaj aj „Upraviť sekciu" (refine).
3. `POST /api/generate` s krátkym nápadom → 400; bez `Origin` hlavičky z cudzej domény → 403; 11. požiadavka za minútu → 429.
4. **Native-feel checklist** (mobil, viď `docs/NATIVE_APP_FEEL_DIAGNOSTIKA_A_BACKLOG.md` §6): žiadny výber textu/callout, žiadny bounce/pull-to-refresh, žiadny zoom, žiadne tap-highlight, skrytý scrollbar, safe-areas pri notch/home bar, klávesnica neposúva obsah mimo obrazovku.
5. **PWA**: Android Chrome → „Pridať na plochu"; iOS Safari → Zdieľať → „Pridať na plochu"; appka beží standalone bez Safari lišty.
6. Response headers: `curl -I https://<domena>/` → CSP, nosniff, XFO, Referrer-Policy prítomné.
7. Lighthouse (Chrome DevTools, mobile): PWA kategória 100, Performance ≥ 90.

---

## 6. Rollback a monitoring

- Rollback: `vercel rollback` (alebo redeploy konkrétneho commitu cez Dashboard → Deployments → … → Promote to Production).
- Preview deploys: každý PR automaticky dostane preview URL — testuj na ňom pred merge do main.
- Logy funkcie: Vercel Dashboard → projekt → Functions → `api/index.ts` (alebo `vercel logs <deployment-url>`).
- Rate-limit/429 a AI chyby sa logujú do konzoly funkcie (`console.error('Gemini /api/generate error:', …)`).

---

## 7. Lokálne „rovnaké ako produkcia“ (pred deployom)

```bash
bun run check        # lint (tsc) + 46 testov (unit + e2e) + vite build
bun run build && NODE_ENV=production bun run start   # server.ts servuje dist/ + API na :3000
# potom smoke test ako v §5 proti http://127.0.0.1:3000
```

V `NODE_ENV=production` sa zapne aj CSP vo funkcii (`server/security.ts`), takže lokálny produkčný mód verne simuluje Vercel.
