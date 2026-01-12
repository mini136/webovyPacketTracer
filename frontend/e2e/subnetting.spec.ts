import { test, expect } from '@playwright/test';

test('Subnetting calculator computes network and broadcast', async ({ page }) => {
  await page.goto('/');
  // login as admin to reach app
  await expect(page.locator('text=Přihlášení')).toBeVisible();
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Přihlásit")');
  await expect(page.getByRole('heading', { name: 'Network Simulator', exact: true })).toBeVisible({ timeout: 10000 });

  // Open subnetting calc
  await page.click('button:has-text("🧮 Subnetting Calc")');
  await expect(page.locator('text=Subnetting Calculator')).toBeVisible();

  // Fill input and calculate
  await page.fill('input[placeholder="192.168.1.0"]', '192.168.50.0');
  await page.fill('input[type="number"]', '26');
  await page.click('button:has-text("🔍 Vypočítat")');

  // Expect results with network and broadcast
  await expect(page.locator('text=Síťová Adresa')).toBeVisible();
  await expect(page.locator('text=Broadcast Adresa')).toBeVisible();
  await expect(page.locator('text=192.168.50.0/26')).toBeVisible();
});
