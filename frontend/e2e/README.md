# E2E Testování - Network Simulator

Automatizované end-to-end testy pomocí Playwright pro testování webové aplikace Network Simulator.

## 📋 Obsah testů

### 1. **auth.spec.ts** - Autentizace
- ✅ Registrace nového uživatele
- ✅ Přihlášení s výchozím admin účtem
- ✅ Neúspěšné přihlášení se špatnými údaji
- ✅ Přepínání mezi přihlášením a registrací

### 2. **network-editor.spec.ts** - Síťový editor
- ✅ Vytvoření ukázkové sítě
- ✅ Přidání nového routeru pomocí drag & drop
- ✅ Přidání switche a PC do sítě
- ✅ Otevření vlastností zařízení (Properties Panel)
- ✅ Uložení a načtení topologie

### 3. **cli-terminal.spec.ts** - CLI Terminal
- ✅ Otevření CLI terminálu na routeru
- ✅ Základní CLI příkazy (show commands)
- ✅ IPv6 příkazy (show ipv6 interface brief, show ipv6 route)
- ✅ Konfigurace routeru (enable, configure terminal, hostname)
- ✅ Konfigurace IPv6 na interfacu
- ✅ Help příkaz
- ✅ Zavření CLI terminálu

## 🚀 Jak spustit testy

### Předpoklady
1. **Backend server** musí běžet na `http://localhost:3000`
2. **MongoDB** musí běžet (Docker container nebo lokálně)
3. **Frontend** se automaticky spustí při testování (nebo můžeš mít běžící `npm run dev`)

### Instalace prohlížečů Playwright (jednorázově)
```powershell
cd frontend
npx playwright install chromium
```

### Spuštění testů

#### Základní spuštění (headless mode)
```powershell
cd frontend
npm test
```

#### Spuštění s viditelným prohlížečem
```powershell
npm run test:headed
```

#### Interaktivní UI mode (nejlepší pro vývoj)
```powershell
npm run test:ui
```

#### Debug mode (krokování testů)
```powershell
npm run test:debug
```

#### Spuštění konkrétního testu
```powershell
npm test auth.spec.ts
npm test network-editor.spec.ts
npm test cli-terminal.spec.ts
```

#### Zobrazení HTML reportu
```powershell
npm run test:report
```

## 📊 Výstupy testů

Po spuštění testů najdeš:
- **HTML report**: `playwright-report/index.html`
- **Screenshots**: pouze při selhání testu
- **Videa**: pouze při selhání testu
- **Traces**: pro debug při selhání

## 🛠️ Struktura souborů

```
frontend/
├── e2e/
│   ├── auth.spec.ts              # Testy autentizace
│   ├── network-editor.spec.ts    # Testy síťového editoru
│   ├── cli-terminal.spec.ts      # Testy CLI terminálu
│   └── helpers.ts                # Helper funkce pro testy
├── playwright.config.ts          # Konfigurace Playwright
└── package.json                  # NPM scripty pro testy
```

## 🔧 Helper funkce

V souboru `e2e/helpers.ts` najdeš užitečné helper funkce:

```typescript
// Přihlášení jako admin
await loginAsAdmin(page);

// Vytvoření ukázkové sítě
await createSampleNetwork(page);

// Otevření CLI terminálu
const cliInput = await openCLI(page, 'Router-1');

// Vykonání CLI příkazu
await executeCLICommand(cliInput, 'show ip interface brief');
```

## 📝 Psaní nových testů

### Základní template:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Název testovací skupiny', () => {
  
  test.beforeEach(async ({ page }) => {
    // Setup před každým testem
    await page.goto('/');
    // ... přihlášení, vytvoření sítě, atd.
  });
  
  test('Název testu', async ({ page }) => {
    // Test kroky
    await page.click('button');
    await expect(page.locator('text=Result')).toBeVisible();
  });
});
```

### S použitím helper funkcí:

```typescript
import { test, expect, loginAsAdmin, createSampleNetwork } from './helpers';

test('Můj test', async ({ page }) => {
  await loginAsAdmin(page);
  await createSampleNetwork(page);
  
  // Tvoje testovací logika...
});
```

## 🐛 Debugging

### Příkazový řádek
```powershell
# Spusť test s debug módem
npm run test:debug auth.spec.ts

# Playwright Inspector se otevře a můžeš krokovat test
```

### VS Code
Přidej breakpoint do testu a spusť:
```powershell
npm run test:debug
```

### Trace Viewer
Po selhání testu:
```powershell
npx playwright show-trace trace.zip
```

## ⚙️ Konfigurace

Upravit konfiguraci v `playwright.config.ts`:
- Timeout testů
- Počet workers (paralelní běh)
- Prohlížeče (Chrome, Firefox, Safari)
- Screenshot/video nastavení
- Base URL

## 📦 CI/CD

Pro GitHub Actions nebo jiné CI:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run tests
  run: npm test
  env:
    CI: true
```

## 🔍 Užitečné Playwright selektory

```typescript
// Text obsahuje
page.locator('text=Přesný text')
page.locator('text=/Regex/')

// Podle role
page.getByRole('button', { name: 'Přihlásit' })

// Podle placeholder
page.getByPlaceholder('Email')

// CSS selector
page.locator('.class-name')
page.locator('#id')

// XPath
page.locator('xpath=//button')
```

## 📖 Dokumentace

- [Playwright Documentation](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright Selectors](https://playwright.dev/docs/selectors)

## ❓ Časté problémy

### Backend není dostupný
```
Error: connect ECONNREFUSED localhost:3000
```
**Řešení**: Spusť backend server před testy

### MongoDB nedostupná
```
MongoError: connect ECONNREFUSED
```
**Řešení**: Spusť MongoDB (Docker nebo lokálně)

### Timeout při čekání na element
```
TimeoutError: locator.isVisible: Timeout 5000ms exceeded
```
**Řešení**: Zvyš timeout nebo zkontroluj selektor:
```typescript
await expect(element).toBeVisible({ timeout: 10000 });
```

## 🎯 Best Practices

1. **Používej data-testid atributy** v produkčním kódu pro stabilní selektory
2. **Vyhni se pevným čekáním** (`waitForTimeout`) - používej `waitForSelector`
3. **Testuj chování, ne implementaci** - zaměř se na user flow
4. **Udržuj testy nezávislé** - každý test by měl běžet samostatně
5. **Používej Page Object Model** pro složitější aplikace

## 📈 Pokrytí testů

Aktuální pokrytí:
- ✅ Autentizace (registrace, login, logout)
- ✅ Vytváření síťové topologie
- ✅ CLI operace (show, configure)
- ✅ IPv6 konfigurace

TODO:
- ⏳ Packet tracing
- ⏳ VLAN konfigurace
- ⏳ DHCP server
- ⏳ DNS konfigurace
- ⏳ Admin panel (správa uživatelů)
