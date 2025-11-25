# 🚀 Rychlý Start

## 1️⃣ Nainstaluj MongoDB

### Nejjednodušší způsob - Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Nebo stáhni MongoDB Community: 
https://www.mongodb.com/try/download/community

---

## 2️⃣ Spuštění aplikace

### Automatický start (Windows):
```bash
.\start.ps1
```

### Manuální start:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 3️⃣ Otevři v prohlížeči

Frontend: **http://localhost:5173**

Backend API: **http://localhost:3000**

---

## 🎮 Jak používat

1. **Přidej zařízení** - Klikni na ikony v levém panelu (Router, Switch, PC...)
2. **Propoj zařízení** - Táhni z jednoho zařízení na druhé
3. **Uprav vlastnosti** - Klikni na zařízení, uprav v pravém panelu
4. **Uložit topologii** - Tlačítko "Save Topology" v levém panelu (TODO)

---

## ❓ Problémy?

### MongoDB se nepřipojí
- Zkontroluj: `Get-Service MongoDB` (Windows)
- Nebo použij Docker (viz výše)
- Nebo MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Port už běží
- Backend (3000): Změň v `backend/src/main.ts`
- Frontend (5173): Změň v `frontend/vite.config.ts`

### Node.js verze
- Potřebuješ Node.js 20.19+ nebo 22.12+
- Stáhni: https://nodejs.org/
