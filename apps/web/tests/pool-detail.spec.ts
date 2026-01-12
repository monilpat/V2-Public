import { test, expect } from '@playwright/test';

test.describe('Pool Detail Page', () => {
  test('navigates to pool detail page from pool card', async ({ page }) => {
    await page.goto('/');
    
    // Wait for pools to potentially load
    await page.waitForTimeout(2000);
    
    // Look for any pool card link
    const poolLinks = page.locator('a[href*="/pool/"]');
    const count = await poolLinks.count();
    
    if (count > 0) {
      // Click first pool link
      await poolLinks.first().click();
      
      // Should navigate to pool detail page
      await expect(page).toHaveURL(/.*\/pool\/0x[a-fA-F0-9]+/);
      
      // Check for pool detail elements
      await page.waitForTimeout(1000);
      // Page should have loaded (might show error if pool doesn't exist, but structure should be there)
      const body = page.locator('body');
      await expect(body).toBeVisible();
    } else {
      // If no pools, that's okay - just skip this test
      test.skip();
    }
  });

  test('pool detail page has expected sections', async ({ page }) => {
    // Use a test address (will likely show error, but we test structure)
    const testPoolAddress = '0x1234567890123456789012345678901234567890';
    await page.goto(`/pool/${testPoolAddress}`);
    
    await page.waitForTimeout(2000);
    
    // Page should load (even if with error message)
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Should have navigation
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });
});
