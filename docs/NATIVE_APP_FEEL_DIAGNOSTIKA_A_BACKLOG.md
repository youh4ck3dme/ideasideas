# 📱 Diagnostika „native app feel" + produkčný backlog — IdeaForge

Dokument vznikol ako kompletná diagnostika toho, ako veľmi webová aplikácia (Vite + React 19 + Tailwind 4 v `src/`, PWA cez `vite-plugin-pwa`, Express API v `server.ts`, Next.js migrácia v `app/`) pôsobí ako natívna mobilná appka (Flutter / iOS / Android), plus backlog všetkých krokov až po finálnu produkčnú kvalitu.

Posledná aktualizácia: pozri nižšie sekciu „Čo bolo zmenené" — tie body sú už **hotové** v tomto commite.

---

## 1. Architektúra v skratke (čo sa kde rieši)

| Vrstva | Súbor | Poznámka |
|---|---|---|
| HTML shell + viewport meta | `index.html:4` | viewport, PWA meta, theme-color, pre-mount theme script |
| Globálne štýly (Vite app) | `src/index.css` | base layer, `.app-scroll-viewport`, `.custom-scrollbar`, print |
| Globálne štýly (Next migrácia) | `app/globals.css` | zatiaľ zrkadlo `src/index.css`; `app/` ešte nemá `layout.tsx`/`page.tsx` |
| App shell | `src/App.tsx:217-224` | root kontajner `h-[100dvh] overflow-hidden`, výška sa pri otvorenej klávesnici orezáva cez `useVisualViewport` |
| Hlavička | `src/components/TopAppBar.tsx:27` | už má `pt-[env(safe-area-inset-top)]` |
| Workspace (dashboard) | `src/components/WorkspaceScreen.tsx` | vnútorný scroll v `main.app-scroll-viewport` (`WorkspaceScreen.tsx:137`), fixná spodná navigácia s `env(safe-area-inset-bottom)` (`WorkspaceScreen.tsx:169`) |
| História (drawer) | `src/components/HistoryDrawer.tsx` | scroll kontajner + safe-area (`HistoryDrawer.tsx:87`) |
| Export modal | `src/components/ExportModal.tsx` | scroll kontajner `overscroll-contain` (`ExportModal.tsx:118`) |
| Klávesnica / visualViewport | `src/hooks/useVisualViewport.ts` | už rieši iOS klávesnicu (orezanie výšky shellu + `scrollTo(0,0)`) |
| PWA | `vite.config.ts` (manifest `display: standalone`), `app/manifest.ts` | ikony 192/512/maskable, SW `autoUpdate` |
| API | `server/aiArchitect.ts`, `app/api/*/route.ts`, `lib/rate-limiter.ts` | rate limit 20 req/min/IP, voliteľný Upstash |

---

## 2. Diagnostika podľa 5 pravidiel „native app feel"

### Pravidlo 1 — zákaz označovania textu a iOS lupy (`user-select`, `touch-callout`)
- **Stav pred:** chýbalo. Bolo síce `-webkit-tap-highlight-color: transparent` na `html/body` (`src/index.css:20`), ale žiadny globálny zákaz výberu textu ani `touch-callout` → modré označenie pri ťahaní a iOS lupa „Kopírovať/Zdieľať/Hľadať" pri dlhom podržaní boli aktívne.
- **Riziko:** pri scrollovaní zoznamu prst „chytí" text namiesto posúvania obsahu.
- **✅ Zmenené:** globálny zákaz v `src/index.css` a `app/globals.css` s výnimkou pre `input, textarea, [contenteditable="true"]` (písanie musí zostať možné).

### Pravidlo 2 — spevnený viewport, zákaz bounce / pull-to-refresh, zákaz zoomu
- **Stav pred:** čiastočne. `html, body, #root` už mali `height/max-height: 100dvh`, `overflow: hidden`, `overscroll-behavior: none` (`src/index.css:11-21`) a viewport mal `viewport-fit=cover, interactive-widget=resizes-content` (`index.html:4`). Chýbalo: `maximum-scale=1.0, user-scalable=no` vo viewport meta a `touch-action: pan-y` na `html/body` (dvojklik-zoom, pinch-zoom v prehliadači).
- **Poznámka k `position: fixed` na `html/body` (z master promptu):** zámerne **nepoužité** — aktuálne riešenie cez `100dvh + overflow: hidden` + orezanie výšky cez `useVisualViewport` pri klávesnici je robustnejšie na iOS (s `position: fixed` na body sa láme `visualViewport` a `scrollIntoView` v inputoch). Bounce/pull-to-refresh je tým pádom už teraz eliminovaný cez `overscroll-behavior` + `overflow: hidden`.
- **✅ Zmenené:** viewport meta v `index.html:4` doplnené o `maximum-scale=1.0, user-scalable=no`; `touch-action: pan-y` + `overscroll-behavior-y: none` na `html/body` v oboch CSS.

### Pravidlo 3 — zákaz ťahania obrázkov / ghost dragging
- **Stav pred:** chýbalo (`-webkit-user-drag` nikde).
- **✅ Zmenené:** `img, svg, a { -webkit-user-drag: none !important; user-drag: none !important; }` v oboch CSS.

### Pravidlo 4 — tlmený scroll (friction) a skryté scrollbary na dotykových zariadeniach
- **Stav pred:** `.app-scroll-viewport` už mal `overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain` — czyže natívny momentum s „clamping" (bez gumového efektu) už bežal. Chýbalo: `touch-action: pan-y` na scroll kontajneroch (horizontálne potiahnutie) a skrytie scrollbaru na mobile (`.custom-scrollbar` mal viditeľný tenký scrollbar — na desktop to je žiaduce, na dotykovom zariadení pôsobí „webovo").
- **Rozhodnutie k JS „friction damping" listeneru:** zámerne **neimplementované** — `preventDefault` na `touchmove` by bojoval s natívnym scrollovaním, lámal by `scrollIntoView` pri fokuse inputu a zhoršil prístupnosť. Namiesto toho: natívna fyzika (`-webkit-overflow-scrolling: touch`) + `overscroll-behavior-y: contain` = presne Flutter `ClampingScrollPhysics` na Androide a tlmený bounce na iOS. Scrollbar sa skrýva len na `pointer: coarse` (mobil), na desktope zostáva jemný — produkčný kompromis.
- **✅ Zmenené:** `touch-action: pan-y` na `.app-scroll-viewport`; `@media (pointer: coarse)` skrýva scrollbar; `overscroll-contain` už bolo na draweri/modal.

### Pravidlo 5 — safe areas (Dynamic Island / notch / home bar) a `dvh`
- **Stav pred:** väčšinou OK — `TopAppBar` (`pt-[env(safe-area-inset-top)]`), spodná navigácia (`h-[calc(64px+env(safe-area-inset-bottom))]`), drawer, toast aj hlavný scroll majú `env(safe-area-inset-*)`; všade sa používa `100dvh/85dvh`. Chýbalo: minimálne odsadenie (`max(env(...), 12px)`) v hlavičke a safe-area padding na overlay-i modálov (Export, iOS inštalačný návod).
- **✅ Zmenené:** `TopAppBar` → `pt-[max(env(safe-area-inset-top),12px)]`; Export modal a iOS guide overlay → `pt/pb-[max(16px,env(safe-area-inset-*))]`.

---

## 3. Širšia diagnostika (čo ešte bráni „produkčnej kvalite")

| Oblasť | Stav | Detail |
|---|---|---|
| Bezpečnostné hlavičky | ⚠️ čiastočne | `next.config.ts` má `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` — ale **Express server** (`server.ts`) ich nemá a nemá ani CSP, CORS politiku ani `helmet`. V produkcii beží práve Express + `dist/`. |
| Rate limiting | ✅ | 20 req/min/IP, Upstash voliteľný (`lib/rate-limiter.ts`), použité v oboch API cestách. |
| Validácia vstupu na serveri | ⚠️ over | `validateIdeaInput` len na klientovi; server spolieha na AI schémy (`validateBlueprint`). |
| Testy | ⚠️ | unit testy (`node:test`) existujú pre `server/aiArchitect.ts` a `src/utils/projectLogic.ts`, ale v `package.json` **chýba `test` script** a nie je CI. |
| Prístupnosť (a11y) | ⚠️ | teraz zakazujeme zoom (`user-scalable=no`) — WCAG 1.4.4 to povoľuje len ak je to nevyhnutné; v PWA standalone je to akceptovateľné, ale treba vedieť, že pinch-zoom v Safari prehliadači od iOS 10 nejde zakázať natívne. Chýba `prefers-reduced-motion` handling pre animácie (progress bar, `active:scale`). |
| Výkon | ✅/⚠️ | žiadne ťažké obrázky (iba PWA ikony), fonty s `display=swap`, lazy nie je potrebné (jedna obrazovka). Bez bundle analýzy. |
| PWA/iOS standalone | ⚠️ | `apple-mobile-web-app-status-bar-style: default` — pri dark móde by bolo lepšie `black-translucent` pre full-bleed; chýbajú splash screeny pre iOS; SW `autoUpdate` bez „nová verzia dostupná" notifikácie. |
| Dáta | ⚠️ | projekty len v `localStorage` (kvóta ~5 MB, žiadny export/import zálohy okrem Markdown jedného projektu). |
| Pozorovateľnosť | ❌ | žiadny error tracking / logovanie chýb API (okrem konzoly). |
| Next.js migrácia | ⚠️ | `app/` obsahuje len `globals.css`, `manifest.ts`, `api/*` — chýba `app/layout.tsx` (tam patrí `export const viewport` s `maximumScale: 1, userScalable: false, viewportFit: 'cover'`) a `app/page.tsx`. |

---

## 4. Čo bolo zmenené (tento commit) — mapovanie na master prompt

1. `index.html:4` — viewport doplnený o `maximum-scale=1.0, user-scalable=no` (pravidlo 2).
2. `src/index.css` + `app/globals.css` —
   - globálne `* { -webkit-touch-callout: none; -webkit-user-select: none; user-select: none; -webkit-tap-highlight-color: transparent; }` + výnimka `input, textarea, [contenteditable="true"]` (pravidlo 1),
   - `img, svg, a { -webkit-user-drag: none; user-drag: none; }` (pravidlo 3),
   - `html, body` (+ `#root` v `src/`): `overscroll-behavior-y: none`, `touch-action: pan-y` (pravidlo 2),
   - `.app-scroll-viewport`: `touch-action: pan-y` (pravidlo 4),
   - `@media (pointer: coarse)` skrýva scrollbar (`scrollbar-width: none`, `::-webkit-scrollbar { display: none }`) — čistý app-look na mobile, na desktope zostáva jemný scrollbar (pravidlo 4).
3. `src/components/TopAppBar.tsx:27` — `pt-[max(env(safe-area-inset-top),12px)]` (pravidlo 5).
4. `src/components/ExportModal.tsx:60` a `src/components/PWAInstallChip.tsx:56` — overlay modálov majú safe-area padding `max(16px, env(...))` (pravidlo 5).

**Zámerne nezmenené (a prečo):** `position: fixed` na `html/body` (viď pravidlo 2 — `100dvh + overflow:hidden` + `useVisualViewport` je robustnejšie), JS friction-damping listener (viď pravidlo 4 — natívny clamping už dáva Flutter-like feel).

---

## 5. Backlog až po finálnu produkčnú kvalitu

### 🔴 P0 — tento PR (hotové / v tomto commite)
- [x] Globálny zákaz výberu textu + iOS callout s výnimkou pre inputy (pravidlo 1)
- [x] Viewport bez zoomu (`maximum-scale=1.0, user-scalable=no`) + `touch-action: pan-y` + `overscroll-behavior-y: none` (pravidlo 2)
- [x] Zákaz ťahania obrázkov/SVG/odkazov (pravidlo 3)
- [x] Scroll kontajnery: `touch-action: pan-y`, skrytý scrollbar na `pointer: coarse`, `overscroll-behavior-y: contain` všade (pravidlo 4)
- [x] Safe-area: hlavička `max(env,12px)`, modály `max(16px, env)` (pravidlo 5)
- [x] Zrkadlenie všetkých CSS zmien do `app/globals.css` (Next migrácia)

### 🟠 P1 — pred produkčným launchom
- [x] **Bezpečnosť na Express serveri**: `server/security.ts` (nosniff, X-Frame-Options, Referrer-Policy, CSP s hashom inline theme skriptu, `trust proxy`, same-origin 403 pre `/api/*`) + hlavičky aj na edge cez `vercel.json` `headers`.
- [x] **Serverová validácia vstupu**: `server/validateInput.ts` — idea 10–2500 znakov, whitelist `budget`/`projectType`, refine: sekcia + inštrukcia 3–500 + kompletný projekt; zapojené do `/api/generate` a `/api/refine`.
- [x] **Rate limit aj na Express API** (produkčná Vercel funkcia `api/index.ts` ho doteraz nemala): generate 10/min/IP, refine 20/min/IP, 429 + `Retry-After` + `X-RateLimit-*` (`lib/rate-limiter.ts` cez `createApiApp`).
- [x] **Test script**: `bun run test` / `bun run check` (lint + testy + build) v `package.json`.
- [ ] ~~GitHub Actions CI~~ **zámerne nepridávať** — testy bežia iba lokálne v tomto prostredí; repo nemá `.github/workflows` (GitGuardian beží ako externá integrácia).
- [x] **E2E testy**: `tests/e2e/app.e2e.test.ts` (happy-dom, skutočný React strom App): validačná chyba, kompletný generate flow cez mock `/api/generate`, prepínanie tabov + refine cez mock `/api/refine`, history drawer + export modal. **Unit/integračné**: `tests/unit/` — validácia, rate-limiter, bezpečnostné hlavičky + 400/403/429/503/200 cez loopback server, **egress allowlist** (žiadne externé URL mimo allowlistu), native-feel CSS guard. **Funkčné AI**: serverový pipeline s mock Gemini klientom (parse → schema validácia → 200) + AI flow v UI e2e. **Regresná suita so skriptovaným AI agentom**: `tests/unit/regression.ai-agent.test.ts` (kompletný blueprint + počty sekcií, refine všetkých 5 tabov, retry po 503/zlom JSON, 502 pri trvalo zlom výstupe) + offline demo `bun scripts/demo-generate.ts "nápad"`. Živý AI agent tu nie je možný (žiadny kľúč, žiadne externé volania) — ostrý smoke so skutočným kľúčom je v `docs/VERCEL_DEPLOY_MASTER_PROMPT.md` §5.
- [ ] **Prehliadačové e2e (Playwright)** na mobile viewportoch → až P2 (vyžaduje prostredie s prehliadačom; tu beží DOM-level e2e).
- [x] **Produkčný master prompt pre Vercel deploy**: `docs/VERCEL_DEPLOY_MASTER_PROMPT.md` (čo sa deployuje, env premenné, kroky, bezpečnosť, post-deploy smoke checklist, rollback).
- [x] **Next.js migrácia dokončená**: `app/layout.tsx` (metadata + `export const viewport` so zákazom zoomu, `viewportFit: 'cover'`, `interactiveWidget: 'resizes-content'`, themeColor, theme-init skript proti flashu) + `app/page.tsx` (renderuje `@/src/App`). Overené cez `NEXT_TELEMETRY_DISABLED=1 bun run build:next` — routes `/`, `/api/generate`, `/api/refine`, `/manifest.webmanifest`. Deploy cieľ zostáva Vite + `api/index.ts` podľa `vercel.json`.
- [x] **PWA/iOS polish**: `black-translucent` status bar, `format-detection: telephone=no`, 9 iOS splash screenov (`public/splash-*.png`, generované cez `bun run splash` = `scripts/generate-splash.mjs`), SW update kontrola každú minútu + toast „Je dostupná nová verzia aplikácie / Obnoviť" (`SWUpdateToast`, `controllerchange`), `maskable` ikona už bola.
- [x] **A11y audit**: `@media (prefers-reduced-motion: reduce)` v oboch CSS + `scrollBehavior()` helper (`src/utils/motion.ts`) namiesto natvrdo `smooth`; `:focus-visible` obrys pre buttony/odkazy; Escape zavrie drawer/modály (HistoryDrawer, ExportModal, iOS guide); kontrast hlavných kombinácií ≥ 4.5:1 (AA); výnimka WCAG 1.4.4 (zakázaný zoom) zdokumentovaná — odôvodnenie: PWA standalone app-feel. Testované v `tests/unit/pwa-a11y.test.ts` + e2e (Escape, SW toast).
- [x] **Dáta používateľa — JSON záloha**: `serializeProjectsBackup`/`parseProjectsBackup`/`mergeImportedProjects` v `src/utils/projectLogic.ts` (validácia štruktúry, formát `ideaforge-projects-backup` v1) + tlačidlá „Záloha JSON“/„Import“ v HistoryDraweri (dedupe podľa id). Testy: `tests/unit/projects-backup.test.ts` + 2 e2e (import validnej/zlej zálohy).

### 🟡 P2 — po launchi (kvalita a rast)
- [ ] Error tracking (Sentry alebo vlastný endpoint) + anonymné metriky používania (ktoré taby, úspešnosť generovania).
- [ ] Bundle analýza (`vite-bundle-visualizer`), lazy-loading tabov ak veľkosť narastie.
- [ ] Offline queue pre `/api/generate` (zlyhanie siete → uložiť návrh a opakovať neskôr).
- [ ] Lighthouse CI (PWA kategória = 100, Performance ≥ 90 na 4G mobile).
- [ ] i18n (SK/EN) pripravenosť textov.
- [ ] Dokumentácia „Ako testovať native feel" (manuálny checklist na iOS Safari, iOS standalone, Android Chrome, Android TWA).

---

## 6. Manuálny checklist „native feel" (na skutočnom zariadení)

1. Dlhý podržaný prst kdekoľvek → neobjaví sa lupa ani „Kopírovať/Zdieľať" (okrem inputov).
2. Potiahnutie zoznamu zhora nadol → žiadny pull-to-refresh, žiadny gumový efekt.
3. Ťuknutie na tlačidlo → žiadne sivé/modré prebliknutie.
4. Potiahnutie obrázka/loga → nič sa „neodlepí".
5. Dvojklik / pinch → žiadny zoom.
6. Scroll v zozname → pevný, tlmený, bez „lietania", scrollbar neviditeľný.
7. Dynamic Island / home bar → hlavička a spodná navigácia nie sú prekryté.
8. Otvorenie klávesnice v inpute → obsah sa neposunie mimo obrazovku, input je viditeľný nad klávesnicou.
9. iOS standalone (Pridať na plochu) → žiadna Safari lišta, status bar správny, full-bleed obsah.
