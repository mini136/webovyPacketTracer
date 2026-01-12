import { test, expect } from '@playwright/test';

test.describe('Save / Load Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // login as admin
    await expect(page.locator('text=Přihlášení')).toBeVisible();
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Přihlásit")');
    await expect(page.getByRole('heading', { name: 'Network Simulator', exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('Add a device, save topology and then load it', async ({ page }) => {
    // Add a PC from sidebar
    await page.click('text=PC');

    // Ensure a node label (PC-1 or similar) appears in canvas
    await expect(page.locator('text=PC-1').first()).toBeVisible({ timeout: 5000 });

    // Click Save button (TopBar)
    page.on('dialog', async (dialog) => {
      // accept alert dialogs
      await dialog.accept();
    });

    await page.click('button:has-text("💾 Uložit")');

    // Wait for save alert and then click Load
    await page.waitForTimeout(1000);

    await page.click('button:has-text("📂 Načíst")');

    // After loading, a topology node should be present
    await expect(page.locator('text=PC-1').first()).toBeVisible({ timeout: 5000 });
  });
});
