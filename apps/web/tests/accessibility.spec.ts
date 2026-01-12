import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('home page has proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for main heading
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    
    if (h1Count > 0) {
      await expect(h1.first()).toBeVisible();
    }
    
    // Check for navigation landmarks
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('links have accessible names', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation links
    const navLinks = page.locator('nav a');
    const count = await navLinks.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const link = navLinks.nth(i);
      const text = await link.textContent();
      // Links should have text content or aria-label
      expect(text?.trim().length || await link.getAttribute('aria-label')).toBeTruthy();
    }
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/');
    
    // Check main action buttons
    const buttons = page.locator('button');
    const count = await buttons.count();
    
    // Sample a few buttons
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      
      // Button should have text or aria-label
      expect(text?.trim().length || ariaLabel).toBeTruthy();
    }
  });

  test('form inputs have labels or placeholders', async ({ page }) => {
    await page.goto('/');
    
    // Check form inputs
    const inputs = page.locator('input[type="text"], input[type="number"]');
    const count = await inputs.count();
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const input = inputs.nth(i);
      const placeholder = await input.getAttribute('placeholder');
      const ariaLabel = await input.getAttribute('aria-label');
      const id = await input.getAttribute('id');
      
      // Input should have placeholder, aria-label, or associated label
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const hasLabel = await label.count() > 0;
        expect(placeholder || ariaLabel || hasLabel).toBeTruthy();
      } else {
        expect(placeholder || ariaLabel).toBeTruthy();
      }
    }
  });
});
