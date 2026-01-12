import { test, expect } from '@playwright/test';

test.describe('Labs Panel', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // login as admin
    await expect(page.locator('text=Přihlášení')).toBeVisible();
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Přihlásit")');
    await expect(page.getByRole('heading', { name: 'Network Simulator', exact: true })).toBeVisible({ timeout: 10000 });
  });

  test('Open Labs panel and open a seeded lab in editor', async ({ page }) => {
    // Open Labs
    await page.click('button:has-text("🧪 Laboratoře")');
    await expect(page.locator('text=Laboratoře / Projekty')).toBeVisible();

    // Ensure seeded lab is present
    await expect(page.locator('text=Routing Lab')).toBeVisible({ timeout: 5000 });

    // Click "Otevřít v editoru" inside the Routing Lab card
    const card = page.locator('div', { hasText: 'Routing Lab' }).first();
    await expect(card).toBeVisible();
    await card.locator('button:has-text("Otevřít v editoru")').click();

    // Editor should have device node label from seeded topology (R1)
    await expect(page.locator('text=R1')).toBeVisible({ timeout: 5000 });
  });
});
