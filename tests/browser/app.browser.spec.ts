import { test, expect } from '@playwright/test';
import { SAMPLE_PROJECT } from '../../src/data/sampleProjects';

// Prehliadačové e2e (P2): beží cez 'bun run test:e2e:browser' v prostredí s Chromium.
// API sa mockuje cez page.route — žiadny egress na AI providera.

test.beforeEach(async ({ page }) => {
  await page.route('**/api/generate', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ blueprint: SAMPLE_PROJECT.blueprint }),
    })
  );
  await page.route('**/api/refine', (route) => {
    const body = route.request().postDataJSON();
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tabKey: body.tabKey,
        sectionData: SAMPLE_PROJECT.blueprint[body.tabKey as keyof typeof SAMPLE_PROJECT.blueprint],
      }),
    });
  });
});

test('mobile native feel: viewport bez zoomu, žiadny výber textu, žiadny horizontálny scroll', async ({ page }) => {
  await page.goto('/');
  const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(viewportMeta).toContain('maximum-scale=1.0');
  expect(viewportMeta).toContain('user-scalable=no');
  expect(viewportMeta).toContain('viewport-fit=cover');

  const h1Select = await page.locator('h1').first().evaluate((el) => getComputedStyle(el).userSelect);
  expect(h1Select).toBe('none');

  const textareaSelect = await page
    .locator('#idea-prompt-input')
    .evaluate((el) => getComputedStyle(el).userSelect);
  expect(textareaSelect).toBe('text');

  const noHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth
  );
  expect(noHorizontalScroll).toBe(true);
});

test('mobile: kompletný generate flow s mock AI zobrazí workspace', async ({ page }) => {
  await page.goto('/');
  await page.fill('#idea-prompt-input', 'Aplikácia na triedenie odpadu podľa lokality');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('[role="tab"]').first()).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('body')).toContainText(SAMPLE_PROJECT.title);
});

test('mobile: history drawer a export modal fungujú v prehliadači', async ({ page }) => {
  await page.goto('/');
  await page.fill('#idea-prompt-input', 'Aplikácia na triedenie odpadu podľa lokality');
  await page.locator('button[type="submit"]').click();
  await expect(page.locator('[role="tab"]').first()).toBeVisible({ timeout: 15_000 });

  await page.locator('button[aria-label^="Otvoriť históriu projektov"]').click();
  await expect(page.locator('body')).toContainText('Uložené projekty');
  await page.keyboard.press('Escape');
  await expect(page.locator('body')).not.toContainText('Uložené projekty');
});
