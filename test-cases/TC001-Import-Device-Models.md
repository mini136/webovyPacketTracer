# TC001: Import Device Models

**Čas: ~5 minut**

## Příprava
- URL: **http://localhost:5173**
- Login: `test@example.com` / `Test123!`
- Pokud účet neexistuje, nejprve ho vytvořte

---

## Data pro import

| # | Vendor | Model Name | Type | Throughput |
|---|--------|------------|------|------------|
| 1 | Cisco | Catalyst 2960 | switch | 1000 |
| 2 | HP | ProCurve 2510 | switch | 100 |
| 3 | Cisco | 2811 Router | router | 500 |

---

## Test Steps

### 1. Přihlášení
→ Přihlaste se na http://localhost:5173  
✓ Vidíte hlavní stránku, menu s "Laboratoře"

### 2. Otevřít Import
→ Labs → Import → Device Models  
✓ Formulář pro přidání modelu

### 3-5. Přidat 3 modely
→ Pro každý model z tabulky výše vyplňte formulář a uložte  
✓ Každý import zobrazí success zprávu

### 6. Ověření
→ Přejděte na seznam Device Models  
✓ Všechny 3 modely jsou v seznamu se správnými údaji

### 7. Test: Duplikát
→ Zkuste přidat Cisco Catalyst 2960 znovu  
✓ Chybová zpráva "již existuje" nebo "duplikát"

### 8. Test: Prázdné pole
→ Zkuste přidat model bez názvu  
✓ Validační chyba, formulář neodešle

---

**Tip:** Sledujte F12 Console pro případné chyby
