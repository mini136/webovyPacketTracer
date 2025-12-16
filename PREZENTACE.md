# 🎓 Návod pro prezentaci na školním PC

## 📋 Příprava před prezentací

### ✅ Kontrola připojení k databázi
- **Server:** 46.13.167.200
- **Port:** 30469
- **Database:** network-simulator

## 🚀 Spuštění na školním PC

### 1️⃣ Spusť Backend (NestJS)

```powershell
# Otevři PowerShell v hlavní složce projektu
cd backend
npm run start:dev
```

**Očekávaný výstup:**
```
[Nest] Nest application successfully started
🚀 Backend running on http://localhost:3000
```

### 2️⃣ Spusť Frontend (Vite + React)

```powershell
# Otevři NOVÝ PowerShell terminál
cd frontend
npm run dev
```

**Očekávaný výstup:**
```
VITE ready in XXX ms
➜ Local:   http://localhost:5173/
```

### 3️⃣ Otevři v prohlížeči

Naviguj na: **http://localhost:5173**

## 👤 Přihlašovací údaje

**Admin účet:**
- Username: `admin`
- Password: `admin123`

## 🎯 Co ukázat

### 1. **Autentizace**
- Registrace nového uživatele
- Přihlášení s admin účtem
- Admin panel (👑 Admin Panel tlačítko)

### 2. **Ukázková síť**
- Klikni na "Ukázková Síť" v sidebaru
- Vytvoří se síť s:
  - 2 routery (Router-1, Router-2)
  - 2 switche (Switch-1, Switch-2)
  - 4 PC (PC-1, PC-2, PC-3, PC-4)
  - 4 VLANy (10, 20, 30, 40)

### 3. **IPv4 + IPv6 Dual-Stack**
- Všechna zařízení mají IPv4 i IPv6
- PC-1: `192.168.10.10` + `2001:db8:10::10/64`
- PC-2: `192.168.20.10` + `2001:db8:20::10/64`
- PC-3: `192.168.30.10` + `2001:db8:30::10/64`
- PC-4: `192.168.40.10` + `2001:db8:40::10/64`
- Inter-router: `2001:db8:ffff::1` ↔ `2001:db8:ffff::2`

### 4. **CLI Terminál**
- Klikni na Router-1
- V Properties Panel klikni "CLI"
- Zkus příkazy:
  ```
  show version
  show ip interface brief
  show ipv6 interface brief
  show ipv6 route
  enable
  configure terminal
  hostname TestRouter
  ```

### 5. **Properties Panel**
- Klikni na jakékoli zařízení
- Zobraz:
  - Interfaces (IPv4 + IPv6 konfigurace)
  - Routing Table (IPv4)
  - IPv6 Routing Table
  - DHCP Server (IPv4)
  - DHCPv6 Server (IPv6)
  - DNS Server
  - ARP Table
  - NDP Table (IPv6)
  - MAC Address Table (switche)

### 6. **Ukládání/Načítání**
- Ulož topologii ("💾 Uložit")
- Načti topologii ("📂 Načíst")
- Topologie se ukládá do MongoDB na vzdáleném serveru

### 7. **Admin Panel**
- 👑 Admin Panel → Správa uživatelů
- Vytvoř nového uživatele
- Deaktivuj/Aktivuj uživatele
- Filtrování podle role

## 🧪 Automatické testy (volitelné)

Pokud chceš ukázat testy:

```powershell
cd frontend
npm test
```

**Výsledky:** 22/23 testů projde (95.7% úspěšnost)

**Co testy pokrývají:**
- ✅ Autentizace (přihlášení, registrace)
- ✅ Admin panel (správa uživatelů)
- ✅ CLI příkazy (show, configure, IPv6)
- ✅ Vytváření sítě (drag & drop, ukázková síť)
- ✅ Properties Panel
- ✅ Ukládání/načítání topologie

## ⚠️ Troubleshooting

### Backend se nespustí:
```powershell
# Zkontroluj, jestli je port 3000 volný
netstat -ano | findstr :3000

# Pokud je obsazený, zabij proces
taskkill /PID <PID> /F
```

### Frontend se nespustí:
```powershell
# Zkontroluj port 5173
netstat -ano | findstr :5173

# Pokud je obsazený
taskkill /PID <PID> /F
```

### Nepřipojuje se k databázi:
- Zkontroluj internet
- Zkontroluj firewall
- Ping server: `ping 46.13.167.200`
- Test port: `Test-NetConnection 46.13.167.200 -Port 30469`

## 📊 Technologie

**Backend:**
- NestJS (Node.js framework)
- MongoDB (vzdálená databáze)
- JWT Authentication
- TypeScript

**Frontend:**
- React 19
- Vite
- React Flow (pro canvas)
- Zustand (state management)
- TypeScript

**Testing:**
- Playwright (E2E testy)
- 23 testů
- Automatizované testování CLI, UI, Auth

## 🎨 Funkce

✅ **Síťová simulace** - Packet Tracer klon
✅ **Cisco-style CLI** - Realistické příkazy
✅ **IPv4 + IPv6** - Dual-stack podpora
✅ **VLANy** - Router-on-a-stick
✅ **Routing** - Statické routy
✅ **DHCP/DHCPv6** - Server konfigurace
✅ **DNS** - DNS records
✅ **ARP/NDP** - Address resolution
✅ **MAC Learning** - Switch učení
✅ **Validace** - IPv4/IPv6 address validation
✅ **Auth** - User management + roles
✅ **Persistence** - MongoDB storage

## 🏆 Hodně štěstí s prezentací!

---
Vytvořeno: 16. prosince 2025
