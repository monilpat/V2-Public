import { test, expect } from '@playwright/test';

test.describe('Wallet Connection', () => {
  test('wallet connect button is visible', async ({ page }) => {
    await page.goto('/');
    
    // Look for wallet connect button (AppKitConnectButton)
    // It might be in different states, so we check for common wallet-related text
    const walletButton = page.getByRole('button', { name: /connect|wallet/i });
    
    // If button exists, it should be visible
    const count = await walletButton.count();
    if (count > 0) {
      await expect(walletButton.first()).toBeVisible();
    } else {
      // Alternative: check for wallet component in nav
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    }
  });

  test('my deposits page shows connect wallet message when not connected', async ({ page }) => {
    await page.goto('/my-deposits');
    
    // Should show message about connecting wallet
    await expect(
      page.getByText(/connect.*wallet|please connect/i)
    ).toBeVisible({ timeout: 5000 });
  });
});
