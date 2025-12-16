import { test as base } from '@playwright/test';

/**
 * Helper funkce pro přihlášení uživatele
 */
export async function loginAsAdmin(page: any) {
  await page.goto('/');
  await page.fill('input[type="text"]', 'admin');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Přihlásit")');
  await page.waitForSelector('text=Network Simulator', { timeout: 10000 });
}

/**
 * Helper funkce pro vytvoření ukázkové sítě
 */
export async function createSampleNetwork(page: any) {
  const sampleNetworkButton = page.locator('button:has-text("Ukázková"), button:has-text("ukázková")').first();
  await sampleNetworkButton.click();
  
  page.on('dialog', async (dialog: any) => {
    await dialog.accept();
  });
  
  await page.waitForTimeout(2000);
}

/**
 * Helper funkce pro otevření CLI terminálu na zařízení
 */
export async function openCLI(page: any, deviceName: string) {
  await page.dblclick(`text=${deviceName}`);
  await page.waitForTimeout(1000);
  
  // Vrať CLI input element
  return page.locator('input[type="text"]').last();
}

/**
 * Helper funkce pro vykonání CLI příkazu
 */
export async function executeCLICommand(cliInput: any, command: string, waitMs: number = 500) {
  await cliInput.fill(command);
  await cliInput.press('Enter');
  await cliInput.page().waitForTimeout(waitMs);
}

/**
 * Extended test fixture s připraveným přihlášením
 */
type TestFixtures = {
  authenticatedPage: any;
};

export const test = base.extend<TestFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await loginAsAdmin(page);
    await use(page);
  },
});

export { expect } from '@playwright/test';
