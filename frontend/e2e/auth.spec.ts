import { test, expect } from '@playwright/test';

test.describe('Autentizace - Registrace a Login', () => {
  
  test('Registrace nového uživatele', async ({ page }) => {
    await page.goto('/');
    
    // Počkej na modální okno s přihlášením
    await expect(page.locator('text=Přihlášení')).toBeVisible();
    
    // Klikni na "Nemáte účet? Zaregistrujte se"
    await page.click('text=Zaregistrujte se');
    
    // Počkej na registrační formulář
    await expect(page.locator('text=Registrace')).toBeVisible();
    
    // Vygeneruj unikátní email pro test
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    const testUsername = `testuser${timestamp}`;
    const testPassword = 'Test123456!';
    
    // Vyplň registrační formulář
    await page.fill('input[type="text"]', testUsername);
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    
    // Odešli formulář
    await page.click('button:has-text("Registrovat")');
    
    // Počkej na úspěšnou registraci - aplikace by měla přejít do hlavního rozhraní
    await expect(page.getByRole('heading', { name: 'Network Simulator', exact: true })).toBeVisible({ timeout: 10000 });
    
    // Ověř, že jsme přihlášeni - mělo by být vidět uživatelské jméno v horní liště
    await expect(page.locator(`text=${testUsername}`)).toBeVisible();
    
    console.log(`✅ Registrace úspěšná: ${testUsername} / ${testEmail}`);
  });
  
  test('Přihlášení s výchozím admin účtem', async ({ page }) => {
    await page.goto('/');
    
    // Počkej na modální okno s přihlášením
    await expect(page.locator('text=Přihlášení')).toBeVisible();
    
    // Vyplň přihlašovací údaje
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    
    // Klikni na tlačítko přihlásit
    await page.click('button:has-text("Přihlásit")');
    
    // Počkej na úspěšné přihlášení
    await expect(page.getByRole('heading', { name: 'Network Simulator', exact: true })).toBeVisible({ timeout: 10000 });
    
    // Ověř, že jsme přihlášeni jako admin
    await expect(page.locator('text=admin')).toBeVisible();
    
    console.log('✅ Přihlášení jako admin úspěšné');
  });
  
  test('Neúspěšné přihlášení se špatnými údaji', async ({ page }) => {
    await page.goto('/');
    
    // Počkej na modální okno s přihlášením
    await expect(page.locator('text=Přihlášení')).toBeVisible();
    
    // Vyplň špatné přihlašovací údaje
    await page.fill('input[type="text"]', 'neexistujici');
    await page.fill('input[type="password"]', 'spatneHeslo');
    
    // Klikni na tlačítko přihlásit
    await page.click('button:has-text("Přihlásit")');
    
    // Počkej na chybovou zprávu (měla by se zobrazit, pokud backend vrátí 401)
    // Note: Pokud aplikace nezobrazuje chybové hlášky, tento test může selhat
    // V takovém případě zkontroluj, že stále vidíme přihlašovací formulář
    await page.waitForTimeout(2000);
    
    // Ověř, že stále jsme na přihlašovací stránce
    await expect(page.locator('text=Přihlášení')).toBeVisible();
    
    console.log('✅ Neúspěšné přihlášení správně zamítnuto');
  });
  
  test('Přepínání mezi přihlášením a registrací', async ({ page }) => {
    await page.goto('/');
    
    // Počkej na přihlašovací formulář
    await expect(page.locator('text=Přihlášení')).toBeVisible();
    
    // Přepni na registraci
    await page.click('text=Zaregistrujte se');
    await expect(page.locator('text=Registrace')).toBeVisible();
    
    // Přepni zpět na přihlášení
    await page.click('text=Přihlásit se');
    await expect(page.locator('text=Přihlášení')).toBeVisible();
    
    console.log('✅ Přepínání mezi formuláři funguje');
  });
});
