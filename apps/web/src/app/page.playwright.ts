import { test, expect } from "@playwright/test";

// Smoke: ensure page renders and shows heading

test("home renders", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await expect(page.getByText("dHEDGE Vaults")).toBeVisible();
});
