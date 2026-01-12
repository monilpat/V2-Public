import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('home page renders', async ({ page }) => {
    await page.goto('/');
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded');
    
    // Check URL to ensure we're on the right page
    const url = page.url();
    expect(url).toContain('localhost:3000');
    
    // Wait a bit for React to hydrate
    await page.waitForTimeout(2000);
    
    // Check for main heading (case-insensitive, partial match)
    // Also check for alternative text that might be present
    const heading = page.getByRole('heading', { name: /dHEDGE.*Vaults/i });
    const headingText = page.locator('h1');
    
    // Try both approaches
    try {
      await expect(heading).toBeVisible({ timeout: 5000 });
    } catch {
      // Fallback: check if any h1 contains "Vault" or "dHEDGE"
      const h1Text = await headingText.first().textContent();
      expect(h1Text?.toLowerCase()).toMatch(/vault|dhedge/);
    }
  });

  test('page loads without JavaScript errors', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors (like wallet connection, RPC issues, Reown config)
    const criticalErrors = errors.filter(
      (e) => !e.includes('wallet') && 
             !e.includes('RPC') && 
             !e.includes('403') &&
             !e.includes('network') &&
             !e.includes('MetaMask') &&
             !e.includes('Reown') &&
             !e.includes('web3modal') &&
             !e.includes('Forbidden') &&
             !e.includes('async-storage') &&
             !e.includes('pino-pretty')
    );
    
    // Log errors for debugging if any remain
    if (criticalErrors.length > 0) {
      console.log('Critical errors found:', criticalErrors);
    }
    
    expect(criticalErrors.length).toBe(0);
  });

  test('all static pages load', async ({ page }) => {
    const pages = ['/', '/explore', '/my-deposits', '/stats'];
    
    for (const path of pages) {
      await page.goto(path);
      await page.waitForLoadState('domcontentloaded');
      
      // Page should have loaded (check for body or nav)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    }
  });
});
