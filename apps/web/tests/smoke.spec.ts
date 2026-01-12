import { test, expect } from '@playwright/test';

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

test('home renders', async ({ page }) => {
  await page.goto(base);
  await expect(page.getByText('dHEDGE Vaults')).toBeVisible();
});
