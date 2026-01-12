import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads and displays main elements', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    await expect(page.getByText('dHEDGE Vaults')).toBeVisible();
    await expect(page.getByText(/Create, deposit, withdraw, and trade/i)).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('link', { name: /home/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /explore/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /my deposits/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /stats/i })).toBeVisible();
  });

  test('navigates to explore page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /explore/i }).click();
    await expect(page).toHaveURL(/.*\/explore/);
  });

  test('navigates to my deposits page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /my deposits/i }).click();
    await expect(page).toHaveURL(/.*\/my-deposits/);
    await expect(page.getByText(/my deposits/i)).toBeVisible();
  });

  test('navigates to stats page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /stats/i }).click();
    await expect(page).toHaveURL(/.*\/stats/);
  });

  test('network selector is visible and functional', async ({ page }) => {
    await page.goto('/');
    
    const networkSelector = page.locator('select').first();
    await expect(networkSelector).toBeVisible();
    
    // Check that it has options
    const options = await networkSelector.locator('option').all();
    expect(options.length).toBeGreaterThan(0);
  });
});
