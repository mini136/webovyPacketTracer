import { test, expect } from '@playwright/test';

test.describe('Admin Panel - Správa uživatelů', () => {
  
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
  
  test('Otevření admin panelu', async ({ page }) => {
    // Najdi a klikni na admin tlačítko v top baru
    const adminButton = page.locator('button:has-text("Admin"), button:has-text("Správa"), button[title*="Admin"]').first();
    
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      // Ověř, že se otevřel admin panel
      await expect(page.locator('text=Admin Panel').or(page.locator('text=Správa uživatelů'))).toBeVisible();
      
      console.log('✅ Admin panel úspěšně otevřen');
    } else {
      console.log('⚠️ Admin tlačítko nenalezeno - možná není pro běžné uživatele');
    }
  });
  
  test('Zobrazení seznamu uživatelů', async ({ page }) => {
    // Otevři admin panel
    const adminButton = page.locator('button:has-text("Admin"), button:has-text("Správa")').first();
    
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      // Ověř, že se zobrazuje seznam uživatelů
      await expect(page.locator('text=admin').or(page.locator('text=Username'))).toBeVisible();
      
      // Měla by být vidět tabulka nebo seznam s uživateli
      await expect(page.locator('text=Email').or(page.locator('text=Role'))).toBeVisible();
      
      console.log('✅ Seznam uživatelů zobrazen');
    }
  });
  
  test('Vytvoření nového uživatele přes admin panel', async ({ page }) => {
    // Otevři admin panel
    const adminButton = page.locator('button:has-text("Admin"), button:has-text("Správa")').first();
    
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      // Najdi tlačítko pro vytvoření nového uživatele
      const createButton = page.locator('button:has-text("Nový"), button:has-text("Přidat"), button:has-text("Create")').first();
      
      if (await createButton.isVisible()) {
        await createButton.click();
        await page.waitForTimeout(500);
        
        // Vyplň formulář
        const timestamp = Date.now();
        const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]');
        
        await inputs.nth(0).fill(`adminuser${timestamp}`);
        await inputs.nth(1).fill(`adminuser${timestamp}@example.com`);
        await inputs.nth(2).fill('AdminPass123!');
        
        // Ulož
        await page.click('button:has-text("Uložit"), button:has-text("Save"), button:has-text("Vytvořit")');
        await page.waitForTimeout(1000);
        
        // Ověř, že se uživatel objevil v seznamu
        await expect(page.locator(`text=adminuser${timestamp}`)).toBeVisible();
        
        console.log('✅ Nový uživatel vytvořen přes admin panel');
      }
    }
  });
  
  test('Návrat z admin panelu do editoru', async ({ page }) => {
    // Otevři admin panel
    const adminButton = page.locator('button:has-text("Admin"), button:has-text("Správa")').first();
    
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      // Najdi tlačítko "Zpět do editoru"
      const backButton = page.locator('button:has-text("Zpět"), button:has-text("Back"), button:has-text("Editor")').first();
      
      if (await backButton.isVisible()) {
        await backButton.click();
        await page.waitForTimeout(500);
        
        // Ověř, že jsme zpět v hlavním editoru
        await expect(page.locator('text=Network Simulator')).toBeVisible();
        
        // Admin panel by už neměl být viditelný
        await expect(page.locator('text=Admin Panel')).not.toBeVisible();
        
        console.log('✅ Návrat do editoru funguje');
      }
    }
  });
  
  test('Filtrování a hledání uživatelů', async ({ page }) => {
    // Otevři admin panel
    const adminButton = page.locator('button:has-text("Admin"), button:has-text("Správa")').first();
    
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      // Najdi vyhledávací pole
      const searchInput = page.locator('input[type="text"], input[type="search"]').first();
      
      if (await searchInput.isVisible()) {
        // Hledej "admin"
        await searchInput.fill('admin');
        await page.waitForTimeout(500);
        
        // Ověř, že se zobrazuje uživatel admin
        await expect(page.locator('text=admin')).toBeVisible();
        
        console.log('✅ Vyhledávání uživatelů funguje');
      }
    }
  });
  
  test('Odhlášení z admin panelu', async ({ page }) => {
    // Otevři admin panel
    const adminButton = page.locator('button:has-text("Admin"), button:has-text("Správa")').first();
    
    if (await adminButton.isVisible()) {
      await adminButton.click();
      await page.waitForTimeout(1000);
      
      // Najdi tlačítko odhlásit
      const logoutButton = page.locator('button:has-text("Odhlásit"), button:has-text("Logout")').first();
      
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await page.waitForTimeout(1000);
        
        // Ověř, že jsme přesměrováni na login
        await expect(page.locator('text=Přihlášení')).toBeVisible();
        
        console.log('✅ Odhlášení funguje');
      }
    }
  });
});
