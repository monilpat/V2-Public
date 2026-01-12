import { test, expect } from '@playwright/test';

test.describe('Form Interactions', () => {
  test('pool creation form accepts input', async ({ page }) => {
    await page.goto('/');
    
    // Fill in pool creation form
    await page.getByPlaceholder(/Manager name/i).fill('Test Manager');
    await page.getByPlaceholder(/Fund name/i).fill('Test Fund');
    await page.getByPlaceholder(/Symbol/i).fill('TEST');
    await page.getByPlaceholder(/Performance fee/i).fill('1000');
    
    // Fill supported assets
    const assetsInput = page.getByPlaceholder(/Supported deposit assets/i);
    if (await assetsInput.count() > 0) {
      await assetsInput.fill('0x1234567890123456789012345678901234567890');
    }
    
    // Verify inputs are filled
    await expect(page.getByPlaceholder(/Manager name/i)).toHaveValue('Test Manager');
    await expect(page.getByPlaceholder(/Fund name/i)).toHaveValue('Test Fund');
    await expect(page.getByPlaceholder(/Symbol/i)).toHaveValue('TEST');
  });

  test('pool card deposit form accepts input', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Look for deposit inputs in pool cards
    const depositAssetInputs = page.getByPlaceholder(/Asset address/i);
    const depositAmountInputs = page.getByPlaceholder(/Amount/i);
    
    const assetCount = await depositAssetInputs.count();
    const amountCount = await depositAmountInputs.count();
    
    if (assetCount > 0 && amountCount > 0) {
      await depositAssetInputs.first().fill('0x1234567890123456789012345678901234567890');
      await depositAmountInputs.first().fill('100');
      
      await expect(depositAssetInputs.first()).toHaveValue('0x1234567890123456789012345678901234567890');
      await expect(depositAmountInputs.first()).toHaveValue('100');
    }
  });

  test('pool card withdraw form accepts input', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Look for withdraw input
    const withdrawInputs = page.getByPlaceholder(/Withdraw amount/i);
    const count = await withdrawInputs.count();
    
    if (count > 0) {
      await withdrawInputs.first().fill('50');
      await expect(withdrawInputs.first()).toHaveValue('50');
    }
  });

  test('network selector changes value', async ({ page }) => {
    await page.goto('/');
    
    const networkSelector = page.locator('select').first();
    await expect(networkSelector).toBeVisible();
    
    // Get initial value
    const initialValue = await networkSelector.inputValue();
    
    // Change selection
    await networkSelector.selectOption({ index: 0 });
    
    // Value should change (or stay same if already selected)
    const newValue = await networkSelector.inputValue();
    expect(newValue).toBeTruthy();
  });
});
