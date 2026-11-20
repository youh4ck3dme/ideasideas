import { defineConfig } from '@playwright/test';

// Prehliadačové e2e — beží LEN v prostredí s prehliadačom (lokálne/CI desktop):
//   bunx playwright install chromium
//   bun run build && bun run test:e2e:browser
// (V tomto sandboxe prehliadač nejde — preto check beží DOM-level e2e cez happy-dom.)
export default defineConfig({
  testDir: './tests/browser',
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro-ish
    isMobile: true,
    hasTouch: true,
  },
  webServer: {
    command: 'bunx vite preview --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
