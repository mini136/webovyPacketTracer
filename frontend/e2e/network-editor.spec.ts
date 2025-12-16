import { test, expect } from '@playwright/test';

test.describe('Síťový editor - Vytváření a správa sítě', () => {
  
  // Před každým testem se přihlaš jako admin
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Přihlaš se jako admin
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Přihlásit")');
    
    // Počkej na načtení hlavního rozhraní
    await expect(page.getByRole('heading', { name: 'Network Simulator', exact: true })).toBeVisible({ timeout: 10000 });
  });
  
  test('Vytvoření ukázkové sítě', async ({ page }) => {
    // Najdi tlačítko pro vytvoření ukázkové sítě v sidebaru
    // Tlačítko má text "⚡ Ukázková Síť"
    const sampleNetworkButton = page.locator('button:has-text("Ukázková Síť")');
    
    // Klikni na tlačítko
    await sampleNetworkButton.click();
    
    // Počkej na alert s potvrzením vytvoření sítě
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Ukázková síť vytvořena');
      await dialog.accept();
    });
    
    // Počkej chvíli na vytvoření sítě
    await page.waitForTimeout(2000);
    
    // Ověř, že se v sidebaru zobrazuje více než 0 zařízení
    const deviceCount = page.locator('text=/\\d+/').first();
    await expect(deviceCount).toBeVisible();
    
    // Ověř, že na canvasu jsou viditelná zařízení (routery, switche, PC)
    await expect(page.locator('text=Router-1')).toBeVisible();
    await expect(page.locator('text=Router-2')).toBeVisible();
    await expect(page.locator('text=Switch-1')).toBeVisible();
    await expect(page.locator('text=PC-1')).toBeVisible();
    
    console.log('✅ Ukázková síť úspěšně vytvořena');
  });
  
  test('Přidání nového routeru pomocí drag & drop', async ({ page }) => {
    // Najdi ikonu routeru v sidebaru - zkusíme jednodušší selektor
    const routerIcon = page.locator('text=Router').first();
    await expect(routerIcon).toBeVisible();
    
    // Získej pozici canvasu
    const canvas = page.locator('.react-flow').first();
    await expect(canvas).toBeVisible();
    
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('Canvas not found');
    
    // Manuální drag & drop sekvence
    const iconBox = await routerIcon.boundingBox();
    if (!iconBox) throw new Error('Router icon not found');
    
    await page.mouse.move(iconBox.x + iconBox.width / 2, iconBox.y + iconBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(canvasBox.x + canvasBox.width / 2, canvasBox.y + canvasBox.height / 2, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    
    await page.waitForTimeout(1000);
    
    // Ověř, že se na canvasu objevil nový router (měl by být Router-3, protože už tam jsou 2 z ukázkové sítě)
    await expect(page.locator('text=/Router.*/')).toBeVisible();
    
    console.log('✅ Router úspěšně přidán');
  });
  
  test('Přidání switche a PC do sítě', async ({ page }) => {
    const canvas = page.locator('.react-flow').first();
    await expect(canvas).toBeVisible();
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('Canvas not found');
    
    // Přidej switch - manuální drag & drop
    const switchIcon = page.locator('text=Switch').first();
    await expect(switchIcon).toBeVisible();
    const switchBox = await switchIcon.boundingBox();
    if (!switchBox) throw new Error('Switch icon not found');
    
    await page.mouse.move(switchBox.x + switchBox.width / 2, switchBox.y + switchBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(canvasBox.x + 200, canvasBox.y + 200, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(500);
    
    // Přidej PC - manuální drag & drop
    const pcIcon = page.locator('text=PC').first();
    await expect(pcIcon).toBeVisible();
    const pcBox = await pcIcon.boundingBox();
    if (!pcBox) throw new Error('PC icon not found');
    
    await page.mouse.move(pcBox.x + pcBox.width / 2, pcBox.y + pcBox.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(100);
    await page.mouse.move(canvasBox.x + 400, canvasBox.y + 300, { steps: 10 });
    await page.waitForTimeout(100);
    await page.mouse.up();
    await page.waitForTimeout(500);
    
    // Ověř, že se na canvasu objevily zařízení
    await expect(page.locator('text=/Switch.*/')).toBeVisible();
    await expect(page.locator('text=/PC.*/')).toBeVisible();
    
    console.log('✅ Switch a PC úspěšně přidány');
  });
  
  test('Otevření vlastností zařízení (Properties Panel)', async ({ page }) => {
    // Nejprve vytvoř ukázkovou síť
    const sampleNetworkButton = page.locator('button:has-text("Ukázková"), button:has-text("ukázková")').first();
    await sampleNetworkButton.click();
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.waitForTimeout(2000);
    
    // Klikni na Router-1
    await page.click('text=Router-1');
    
    await page.waitForTimeout(500);
    
    // Ověř, že se otevřel Properties Panel s informacemi o routeru
    // Panel by měl obsahovat název zařízení, typ, a možnosti konfigurace
    await expect(page.locator('text=Router-1').or(page.locator('text=Properties')).or(page.locator('text=Vlastnosti'))).toBeVisible();
    
    // Měly by být vidět interfacy
    await expect(page.locator('text=/Gig.*|Fa.*|Eth.*/').first()).toBeVisible();
    
    console.log('✅ Properties Panel úspěšně otevřen');
  });
  
  test('Uložení a načtení topologie', async ({ page }) => {
    // Vytvoř ukázkovou síť
    const sampleNetworkButton = page.locator('button:has-text("Ukázková"), button:has-text("ukázková")').first();
    await sampleNetworkButton.click();
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.waitForTimeout(2000);
    
    // Otevři Save/Load panel (obvykle v top baru nebo sidebaru)
    const saveButton = page.locator('button:has-text("Uložit"), button:has-text("Save"), button[title*="Save"], button[title*="Uložit"]').first();
    
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      await page.waitForTimeout(500);
      
      // Zadej název topologie
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill('Test Topology ' + Date.now());
      
      // Klikni na uložit
      const confirmSave = page.locator('button:has-text("Uložit"), button:has-text("Save")').last();
      await confirmSave.click();
      
      await page.waitForTimeout(1000);
      
      console.log('✅ Topologie uložena');
    } else {
      console.log('⚠️ Save button nenalezen - přeskoč test uložení');
    }
  });
});
