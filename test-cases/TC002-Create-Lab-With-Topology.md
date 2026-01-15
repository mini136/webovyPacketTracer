# TC002: Vytvoření Lab a otevření v editoru

**Čas: ~5 minut**

## Příprava
- URL: **http://localhost:5173**
- Login: `admin` / `admin123` (nebo jiný registrovaný uživatel)
- Backend a frontend musí běžet
- MSSQL databáze musí být inicializována (včetně DeviceModel tabulky)

---

## Data pro testy

**Lab 1:**
- Name: `Testovací síť`
- Is Public: Ne (checkbox nezaškrtnutý)

**Lab 2:**
- Name: `Veřejná laboratoř`
- Is Public: Ano (checkbox zaškrtnutý)

---

## Test Steps

### 1. Přihlášení
→ Otevřete **http://localhost:5173**  
→ Přihlaste se pomocím: `admin` / `admin123`  
✓ Po úspěšném přihlášení se zobrazí hlavní editor s TopBar  
✓ V TopBar vpravo vidíte tlačítko "🧪 Laboratoře"

### 2. Otevřít Labs Panel
→ Klikněte na tlačítko "🧪 Laboratoře" v pravém horním rohu  
✓ Otevře se floating panel "Laboratoře / Projekty" vpravo nahoře  
✓ Panel obsahuje: input pole "Název", checkbox "Veřejné", tlačítko "＋", a seznam existujících labs  
✓ Pokud nejsou žádné labs, zobrazí se "Zatím žádné laboratoře."

### 3. Vytvořit první lab
→ Do input pole "Název" zadejte: `Testovací síť`  
→ Checkbox "Veřejné" nechte nezaškrtnutý  
→ Klikněte na tlačítko "＋"  
✓ Tlačítko se změní na "⏳" (indikátor načítání)  
✓ Po dokončení se input pole vyprázdní  
✓ V seznamu se objeví nový lab "Testovací síť"

### 4. Ověření detailů vytvořeného labu
→ Najděte "Testovací síť" v seznamu  
✓ Lab obsahuje:
  - Název: "Testovací síť"  
  - Řádek s informacemi: "Stav: ready · Zařízení: 0 · Běhy: 0"  
  - Status vpravo: "Private" (šedá barva)  
  - Tlačítko: "Otevřít v editoru" (zelené)

### 5. Otevřít lab v editoru
→ Klikněte na tlačítko "Otevřít v editoru"  
✓ Labs Panel se zavře  
✓ Editor se otevře s prázdnou topologií (žádná zařízení ani spojení)  
✓ V levém sidebaru můžete přidat zařízení

### 6. Přidat zařízení do topologie
→ V levém sidebaru klikněte na sekci "Network Devices"  
→ Přetáhněte 1 router (např. "Router") na canvas  
→ Přetáhněte 1 switch (např. "Switch") na canvas  
✓ Na canvasu se zobrazí 2 zařízení  
✓ Zařízení můžete přesouvat

### 7. Uložit topologii
→ V horním menu klikněte na tlačítko "💾 Uložit"  
✓ Topologie se uloží do MongoDB  
✓ Zobrazí se potvrzovací zpráva

### 8. Otevřít Labs Panel znovu
→ Klikněte na "🧪 Laboratoře"  
✓ Panel se otevře  
✓ "Testovací síť" stále existuje ve stavu "ready"

### 9. Vytvořit veřejný lab
→ Do input pole zadejte: `Veřejná laboratoř`  
→ Zaškrtněte checkbox "Veřejné"  
→ Klikněte na "＋"  
✓ Lab se vytvoří  
✓ V seznamu se objeví "Veřejná laboratoř" se statusem "Public" (zelená barva)

### 10. Refresh seznamu
→ Klikněte na tlačítko "↻" vedle nadpisu "Seznam"  
✓ Tlačítko se změní na "⏳"  
✓ Seznam se znovu načte a zobrazí všechny labs

### 11. Zavřít panel
→ Klikněte na "✕" v pravém horním rohu panelu  
✓ Panel se zavře  
✓ Editor zůstane otevřený

---

## POZNÁMKY

- **Backend automaticky vytváří MongoDB topologii** při vytvoření labu, proto má každý nový lab ihned status "ready" a tlačítko "Otevřít v editoru"
- **Allowed Models (povolené typy zařízení)** se v tomto UI nenastavují - systém automaticky přidá default model při vytváření labu
- **Labs Panel je overlay**, ne samostatná stránka - zůstává nad editorem
- Pokud se změny nezobrazují, zkuste kliknout na refresh tlačítko "↻" v panelu

---

**Očekávaný výsledek:** Uživatel může vytvářet labs, otevírat je v editoru, přidávat zařízení a ukládat topologii.
