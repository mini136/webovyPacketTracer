# Test Cases pro MSSQL funkcionality

Zkrácené test cases pro rychlé manuální testování (celkem ~20 minut).

## Přehled

| ID | Název | Čas | Popis |
|----|-------|-----|-------|
| TC001 | Import Device Models | ~5 min | Import zařízení přes UI |
| TC002 | Vytvoření Lab | ~7 min | Vytvoření labu s topologií |
| TC003 | Update & Delete Lab | ~8 min | Úprava a smazání labu |

## Prerekvizity

1. Aplikace běží na: **http://localhost:5173**
2. Testovací účet: `test@example.com` / `Test123!`
3. Pouze webový prohlížeč (Chrome, Firefox, Edge)
   - Email: `test@example.com`
   - Password: `Test123!`
   - Nebo jiný registrovaný účet

## Jak testovat

### 1. Příprava prostředí

```bash
# Spustit backend
cd backend
npm install
npm run start:dev

# Ověřit, že běží
curl http://localhost:3000
```

### 2. Testování krok za krokem

1. Otevřte soubor test case (např. `TC001-Import-Device-Models.md`)
2. Postupujte podle kroků v dokumentu
3. Vyplňujte:
   - **Skutečný výsledek** - co se skutečně stalo
   - **Status** - zaškrtněte Pass nebo Fail
   - **Poznámky** - jakékoliv další informace
4. Na konci vyplňte shrnutí a nalezené bugy

### 3. Doporučené pořadí testování

1. **TC001** - Import Device Models (vytvoří testovací data)
2. **TC002** - Vytvoření Lab (používá data z TC001)
3. **TC003** - Update/Delete Lab (modifikace dat)

### 4. Převod do PDF

Můžete použít některý z těchto nástrojů:

**Online konvertory:**
- [Markdown to PDF](https://www.markdowntopdf.com/)
- [Dillinger.io](https://dillinger.io/) (export as PDF)

**VS Code:**
- Nainstalujte extension "Markdown PDF"
- Otevřete `.md` soubor
- Ctrl+Shift+P → "Markdown PDF: Export (pdf)"

**Pandoc (příkazová řádka):**
```bash
pandoc TC001-Import-Device-Models.md -o TC001-Import-Device-Models.pdf
```

## Reporting bugů

Pokud najdete bug:

1. Vyplňte sekci "Nalezené bugy" v test case
2. Uveďte:
   - Číslo kroku kde se bug vyskytl
   - Očekávané vs skutečné chování
   - Kroky k reprodukci
   - Screenshot nebo log (pokud je relevantní)

## Struktura test case

Každý test case obsahuje:

- **Metadata** - základní info o testu
- **Předpoklady** - co musí být splněno před testem
- **Testovací data** - konkrétní data pro test
- **Kroky testu** - detailní postup
- **Negativní testy** - testování chybových stavů
- **Shrnutí** - přehledná tabulka výsledků
- **Přílohy** - místo pro screenshots a logy

## Kontakt

Pokud máte otázky k testům nebo najdete nějaký problém, kontaktujte:
- Vývojář: [vaše jméno]
- Email: [váš email]

---

**Poslední aktualizace:** 15. ledna 2026
