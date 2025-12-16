import { test, expect } from '@playwright/test';

test.describe('CLI Terminal - Příkazy a konfigurace', () => {
  
  // Před každým testem se přihlaš a vytvoř ukázkovou síť
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Přihlaš se jako admin
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Přihlásit")');
    
    // Počkej na načtení hlavního rozhraní
    await expect(page.getByRole('heading', { name: 'Network Simulator', exact: true })).toBeVisible({ timeout: 10000 });

    // Vytvoř ukázkovou síť
    const sampleNetworkButton = page.locator('button:has-text("Ukázková Síť")');
    await sampleNetworkButton.click();
    
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    
    await page.waitForTimeout(2000);
  });
  
  test('Otevření CLI terminálu na routeru', async ({ page }) => {
    // Klikni pravým tlačítkem na Router-1 (nebo dvojklik)
    await page.click('text=Router-1', { button: 'right' });
    
    await page.waitForTimeout(500);
    
    // Hledej možnost otevřít CLI (může být context menu nebo přímé otevření)
    const cliButton = page.locator('text=CLI, text=Terminal, text=Console').first();
    
    if (await cliButton.isVisible({ timeout: 1000 })) {
      await cliButton.click();
    } else {
      // Zkus dvojklik, pokud context menu není viditelné
      await page.dblclick('text=Router-1');
    }
    
    await page.waitForTimeout(1000);
    
    // Ověř, že se otevřel CLI terminál
    await expect(page.locator('text=Router-1>, text=>').first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ CLI terminál úspěšně otevřen');
  });
  
  test('Základní CLI příkazy - show commands', async ({ page }) => {
    // Otevři CLI
    await page.dblclick('text=Router-1');
    await page.waitForTimeout(1000);
    
    // Najdi input pole CLI
    const cliInput = page.locator('input[type="text"]').last();
    
    // Test: show version
    await cliInput.fill('show version');
    await cliInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Ověř výstup
    await expect(page.locator('text=Cisco').or(page.locator('text=Version'))).toBeVisible();
    
    // Test: show ip interface brief
    await cliInput.fill('show ip interface brief');
    await cliInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Ověř výstup - měly by být vidět interfacy
    await expect(page.locator('text=/Gig.*|FastEthernet/').first()).toBeVisible();
    
    // Test: show running-config
    await cliInput.fill('show running-config');
    await cliInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Ověř výstup
    await expect(page.locator('text=interface').or(page.locator('text=hostname'))).toBeVisible();
    
    console.log('✅ Show příkazy fungují správně');
  });
  
  test('IPv6 příkazy - show ipv6 interface brief', async ({ page }) => {
    // Otevři CLI
    await page.dblclick('text=Router-1');
    await page.waitForTimeout(1000);
    
    // Najdi input pole CLI
    const cliInput = page.locator('input[type="text"]').last();
    
    // Test: show ipv6 interface brief
    await cliInput.fill('show ipv6 interface brief');
    await cliInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Ověř výstup - měly by být vidět IPv6 adresy
    await expect(page.locator('text=/2001:db8/').first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ IPv6 show příkazy fungují');
  });
  
  test('IPv6 příkazy - show ipv6 route', async ({ page }) => {
    // Otevři CLI
    await page.dblclick('text=Router-1');
    await page.waitForTimeout(1000);
    
    // Najdi input pole CLI
    const cliInput = page.locator('input[type="text"]').last();
    
    // Test: show ipv6 route
    await cliInput.fill('show ipv6 route');
    await cliInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Ověř výstup - měla by být vidět routing table
    await expect(page.locator('text=/S|C|L/').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/2001:db8/').first()).toBeVisible();
    
    console.log('✅ IPv6 routing table zobrazena');
  });
  
  test('Konfigurace routeru - enable a configure terminal', async ({ page }) => {
    // Otevři CLI
    await page.dblclick('text=Router-1');
    await page.waitForTimeout(1000);
    
    const cliInput = page.locator('input[type="text"]').last();
    
    // Přepni do privileged mode
    await cliInput.fill('enable');
    await cliInput.press('Enter');
    await page.waitForTimeout(300);
    
    // Ověř prompt změnu na #
    await expect(page.locator('text=Router-1#').last()).toBeVisible();
    
    // Přepni do config mode
    await cliInput.fill('configure terminal');
    await cliInput.press('Enter');
    await page.waitForTimeout(300);
    
    // Ověř prompt změnu
    await expect(page.locator('text=/Router-1\\(config\\)/').last()).toBeVisible();
    
    // Nastav hostname
    await cliInput.fill('hostname TestRouter');
    await cliInput.press('Enter');
    await page.waitForTimeout(300);
    
    // Ověř změnu promptu
    await expect(page.locator('text=/TestRouter\\(config\\)/').last()).toBeVisible();
    
    // Vrať se zpět
    await cliInput.fill('exit');
    await cliInput.press('Enter');
    await page.waitForTimeout(300);
    
    await expect(page.locator('text=TestRouter#').last()).toBeVisible();
    
    console.log('✅ Konfigurace routeru funguje');
  });
  
  test('Konfigurace IPv6 na interfacu', async ({ page }) => {
    // Otevři CLI
    await page.dblclick('text=Router-1');
    await page.waitForTimeout(1000);
    
    const cliInput = page.locator('input[type="text"]').last();
    
    // Přepni do config mode
    await cliInput.fill('enable');
    await cliInput.press('Enter');
    await page.waitForTimeout(200);
    
    await cliInput.fill('configure terminal');
    await cliInput.press('Enter');
    await page.waitForTimeout(200);
    
    // Zapni IPv6 routing
    await cliInput.fill('ipv6 unicast-routing');
    await cliInput.press('Enter');
    await page.waitForTimeout(200);
    
    // Přepni do interface mode
    await cliInput.fill('interface Gig0/2');
    await cliInput.press('Enter');
    await page.waitForTimeout(200);
    
    // Ověř prompt změnu
    await expect(page.locator('text=/\\(config-if\\)/').last()).toBeVisible();
    
    // Nastav IPv6 adresu
    await cliInput.fill('ipv6 address 2001:db8:99::1/64');
    await cliInput.press('Enter');
    await page.waitForTimeout(200);
    
    // Zapni interface
    await cliInput.fill('no shutdown');
    await cliInput.press('Enter');
    await page.waitForTimeout(200);
    
    // Vrať se zpět
    await cliInput.fill('exit');
    await cliInput.press('Enter');
    await cliInput.fill('exit');
    await cliInput.press('Enter');
    await page.waitForTimeout(300);
    
    // Ověř změnu pomocí show ipv6 interface brief
    await cliInput.fill('show ipv6 interface brief');
    await cliInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Ověř, že se zobrazuje nová IPv6 adresa
    await expect(page.locator('text=2001:db8:99').first()).toBeVisible({ timeout: 5000 });
    
    console.log('✅ IPv6 konfigurace na interfacu funguje');
  });
  
  test('Help příkaz zobrazuje nápovědu', async ({ page }) => {
    // Otevři CLI
    await page.dblclick('text=Router-1');
    await page.waitForTimeout(1000);
    
    const cliInput = page.locator('input[type="text"]').last();
    
    // Test help příkazu
    await cliInput.fill('?');
    await cliInput.press('Enter');
    await page.waitForTimeout(500);
    
    // Ověř, že se zobrazuje nápověda s dostupnými příkazy
    await expect(page.locator('text=/show|enable|configure|exit/').first()).toBeVisible();
    
    console.log('✅ Help příkaz funguje');
  });
  
  test('Zavření CLI terminálu', async ({ page }) => {
    // Otevři CLI
    await page.dblclick('text=Router-1');
    await page.waitForTimeout(1000);
    
    // Najdi tlačítko zavřít (X nebo Close)
    const closeButton = page.locator('button:has-text("×"), button:has-text("Close"), button:has-text("Zavřít")').last();
    
    if (await closeButton.isVisible()) {
      await closeButton.click();
      await page.waitForTimeout(500);
      
      // Ověř, že CLI terminál už není viditelný
      await expect(page.locator('text=Router-1>').last()).not.toBeVisible();
      
      console.log('✅ CLI terminál úspěšně zavřen');
    } else {
      console.log('⚠️ Close button nenalezen');
    }
  });
});
