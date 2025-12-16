# 🚀 Instrukce pro nasazení MongoDB na server

## 📦 Co nahrát na server (46.13.167.200)

Nahraj tyto 2 soubory:
```
Dockerfile.mongodb
docker-compose.mongodb.yml
```

## 🔧 Spuštění na serveru

1. **Připoj se na server:**
```bash
ssh user@46.13.167.200
```

2. **Vytvoř složku pro projekt:**
```bash
mkdir -p ~/network-simulator
cd ~/network-simulator
```

3. **Nahraj soubory** (z lokálního PC):
```bash
scp Dockerfile.mongodb user@46.13.167.200:~/network-simulator/
scp docker-compose.mongodb.yml user@46.13.167.200:~/network-simulator/
```

4. **Spusť MongoDB na serveru:**
```bash
cd ~/network-simulator
docker-compose -f docker-compose.mongodb.yml up -d
```

5. **Zkontroluj, že běží:**
```bash
docker ps
```
Měl bys vidět:
```
CONTAINER ID   IMAGE              PORTS                      STATUS
xxx            network-sim-mongo  0.0.0.0:30469->30469/tcp   Up
```

6. **Test spojení ze serveru:**
```bash
nc -zv localhost 30469
```

## 🔒 Firewall (DŮLEŽITÉ!)

Musíš otevřít port 30469 na serveru:

```bash
# Pro UFW (Ubuntu/Debian):
sudo ufw allow 30469/tcp
sudo ufw reload

# Pro firewalld (CentOS/RHEL):
sudo firewall-cmd --permanent --add-port=30469/tcp
sudo firewall-cmd --reload

# Pro iptables:
sudo iptables -A INPUT -p tcp --dport 30469 -j ACCEPT
sudo iptables-save > /etc/iptables/rules.v4
```

## ✅ Test ze školního PC

Z Windows PowerShell otestuj spojení:

```powershell
Test-NetConnection -ComputerName 46.13.167.200 -Port 30469
```

Nebo:
```powershell
telnet 46.13.167.200 30469
```

Mělo by to odpovědět (znamená, že port je otevřený).

## 🎯 Spuštění na školním PC

1. **Stáhni projekt z Gitu:**
```bash
git clone <tvoje-repo-url>
cd webovyPacketTracer
```

2. **Spusť backend:**
```bash
cd backend
npm install
npm run start:dev
```

3. **Spusť frontend (v novém terminálu):**
```bash
cd frontend
npm install
npm run dev
```

4. **Otevři prohlížeč:**
```
http://localhost:5173
```

## 🛑 Zastavení MongoDB na serveru

Když chceš vypnout:
```bash
cd ~/network-simulator
docker-compose -f docker-compose.mongodb.yml down
```

## 📊 Monitorování

Logy MongoDB:
```bash
docker logs network-sim-mongodb -f
```

Statistiky:
```bash
docker stats network-sim-mongodb
```

## ⚠️ Troubleshooting

**Problem: Connection refused**
- Zkontroluj firewall: `sudo ufw status`
- Zkontroluj, že container běží: `docker ps`
- Zkontroluj logy: `docker logs network-sim-mongodb`

**Problem: Backend se nemůže připojit**
- Ověř, že backend/src/app.module.ts má správnou adresu:
  ```typescript
  mongodb://46.13.167.200:30469/network-simulator
  ```

**Problem: Port už je použitý**
```bash
# Zjisti, co používá port 30469
sudo lsof -i :30469
# Nebo
sudo netstat -tulpn | grep 30469
```

## 🔐 Zabezpečení (volitelné, pro produkci)

Pokud chceš zabezpečit MongoDB:

1. Přidej do `docker-compose.mongodb.yml`:
```yaml
environment:
  - MONGO_INITDB_ROOT_USERNAME=admin
  - MONGO_INITDB_ROOT_PASSWORD=strongPassword123
  - MONGO_INITDB_DATABASE=network-simulator
```

2. Aktualizuj backend connection string:
```typescript
mongodb://admin:strongPassword123@46.13.167.200:30469/network-simulator
```

---

**🎓 Pro prezentaci stačí:**
1. Nahrát 2 soubory na server
2. Spustit `docker-compose up -d`
3. Otevřít port 30469
4. Na školním PC spustit backend + frontend
5. PROFIT! 🚀
