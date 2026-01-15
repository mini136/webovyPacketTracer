# TC003: Práce s Labs - Test funkcí panelu

**Čas: ~6 minut**

## Příprava
- URL: **http://localhost:5173**
- Login: `admin` / `admin123`
- Vytvořte alespoň 2 testovací labs pro tento test (viz TC002)

---

## Data pro testy

**Lab pro test "Připojit topologii":**
- Name: `Lab bez topologie`
- Is Public: Ne

**Lab s topologií pro test otevření:**
- Name: `Lab s topologií`
- Is Public: Ano
- Topologie: obsahuje alespoň 1 router (R1)

---

## Test Steps

### PŘÍPRAVA: Simulace labu bez topologie

> **Poznámka:** Normálně backend automaticky vytváří topologii, ale můžeme testovat tlačítko "Připojit topologii" ručním vymazáním MongoTopologyId v MSSQL databázi.

→ V MSSQL Management Studio spusťte:
```sql
UPDATE dbo.Lab 
SET MongoTopologyId = NULL 
WHERE Name = 'Lab bez topologie'
```
✓ Lab nyní nemá připojenou topologii

---

## TEST 1: Načtení seznamu labs

### 1. Otevřít Labs Panel
→ Přihlaste se jako admin  
→ Klikněte na "🧪 Laboratoře"  
✓ Panel se otevře s názvem "Laboratoře / Projekty"  
✓ Zobrazí se seznam všech labs (včetně veřejných labs od jiných uživatelů)

### 2. Kontrola údajů v seznamu
→ Najděte několik labs v seznamu  
✓ Každý lab zobrazuje:
  - Název labu  
  - Řádek s informacemi: "Stav: [status] · Zařízení: [počet] · Běhy: [počet]"  
  - Status: "Public" (zelený) nebo "Private" (šedý)  
  - Akční tlačítko (zelené "Otevřít v editoru" nebo žluté "Připojit topologii")

### 3. Test refresh tlačítka
→ Klikněte na tlačítko "↻" vedle nadpisu "Seznam"  
✓ Tlačítko se změní na "⏳"  
✓ Seznam se znovu načte  
✓ Tlačítko se vrátí na "↻"

---

## TEST 2: Připojení topologie k labu

### 4. Najít lab bez topologie
→ V seznamu najděte "Lab bez topologie"  
✓ Lab má žluté tlačítko "Připojit topologii"  
✓ **Pokud lab nemá toto tlačítko**, spusťte UPDATE SQL z přípravy výše

### 5. Připojit topologii
→ Klikněte na tlačítko "Připojit topologii"  
✓ Backend vytvoří novou MongoDB topologii  
✓ Seznam se automaticky obnoví  
✓ Lab nyní má zelené tlačítko "Otevřít v editoru"

### 6. Ověření změny
→ Najděte tentýž lab v seznamu znovu  
✓ Tlačítko se změnilo ze žlutého "Připojit topologii" na zelené "Otevřít v editoru"

---

## TEST 3: Otevření labu v editoru

### 7. Otevřít lab s topologií
→ Najděte "Lab s topologií" v seznamu  
→ Klikněte na "Otevřít v editoru"  
✓ Panel se zavře  
✓ Editor se otevře  
✓ Na canvasu se zobrazí zařízení z topologie (např. "R1")  
✓ Spojení mezi zařízeními se také zobrazí (pokud existují)

### 8. Ověření načtených dat
→ Klikněte na zařízení v editoru  
✓ V pravém panelu "Vlastnosti Zařízení" se zobrazí detaily  
✓ Můžete upravovat konfiguraci

---

## TEST 4: Vytvoření nového labu s různými nastaveními

### 9. Vytvořit private lab
→ Otevřete Labs Panel (🧪 Laboratoře)  
→ Do pole "Název" zadejte: `Test Private Lab`  
→ Checkbox "Veřejné" nechte **NEZAŠKRTNUTÝ**  
→ Klikněte "＋"  
✓ Lab se vytvoří  
✓ V seznamu má status "Private" (šedá barva)

### 10. Vytvořit public lab
→ Do pole "Název" zadejte: `Test Public Lab`  
→ Checkbox "Veřejné" **ZAŠKRTNĚTE**  
→ Klikněte "＋"  
✓ Lab se vytvoří  
✓ V seznamu má status "Public" (zelená barva)

---

## TEST 5: Validace a chybové stavy

### 11. Test: Prázdný název
→ Input pole "Název" nechte prázdné  
→ Klikněte "＋"  
✓ Zobrazí se červená chybová zpráva: "Zadej název laboratoře."  
✓ Lab se nevytvoří

### 12. Test: Whitespace název
→ Do pole "Název" zadejte pouze mezery: `   `  
→ Klikněte "＋"  
✓ Zobrazí se chybová zpráva  
✓ Lab se nevytvoří

### 13. Test: Dlouhý název
→ Do pole "Název" zadejte text delší než 120 znaků  
→ Klikněte "＋"  
✓ Backend vrátí validační chybu (nebo frontend předvaliduje)  
✓ Zobrazí se chybová zpráva

---

## TEST 6: Zavření panelu

### 14. Zavřít panel křížkem
→ Klikněte na "✕" v pravém horním rohu Labs Panelu  
✓ Panel se zavře  
✓ Editor zůstane viditelný

### 15. Zavřít panel kliknutím mimo
→ Otevřete Labs Panel znovu  
→ Klikněte kamkoliv mimo panel (na canvas editoru)  
✓ **Poznámka:** Panel se nezavře - zavírá se pouze křížkem nebo otevřením labu

---

## POZNÁMKY

- **UPDATE a DELETE funkcionalita** není v současné verzi UI implementována - labs lze pouze vytvářet a otevírat
- **Backend API** podporuje PUT /labs/:id a DELETE /labs/:id, ale frontend nemá UI tlačítka pro tyto akce
- **Allowed Models** se nenastavují přes UI - backend automaticky přidá default model
- **Sorting:** Labs jsou seřazeny podle CreatedAt (nejnovější nahoře)
- **Veřejné labs:** Zobrazují se všem uživatelům, private labs vidí pouze vlastník

---

**Očekávaný výsledek:** Uživatel může procházet seznam labs, vytvářet nové labs (private i public), připojovat topologie a otevírat labs v editoru.
