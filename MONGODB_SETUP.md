# Instalace a spuštění MongoDB

## Windows

### Možnost 1: MongoDB Community Server (Doporučeno)
1. Stáhni z: https://www.mongodb.com/try/download/community
2. Instaluj s výchozími nastaveními
3. MongoDB se automaticky spustí jako služba

### Možnost 2: MongoDB přes Docker (Jednodušší)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Ověření běžící MongoDB
```bash
# PowerShell
Get-Service MongoDB

# Nebo zkus připojit
mongosh
```

## Rychlé řešení bez instalace
Pokud nechceš instalovat MongoDB lokálně, můžeš použít:

1. **MongoDB Atlas** (Cloud, zdarma):
   - Jdi na https://www.mongodb.com/cloud/atlas
   - Vytvoř free cluster
   - Získej connection string
   - Nahraď v `backend/src/app.module.ts`:
   ```typescript
   MongooseModule.forRoot('mongodb+srv://username:password@cluster.mongodb.net/network-simulator')
   ```

2. **Docker** (Nejrychlejší):
   ```bash
   docker run -d -p 27017:27017 mongo
   ```
