# 🐳 Spuštění MongoDB na portu 30111

## Možnost 1: Samostatný MongoDB container

```bash
docker-compose -f docker-compose.mongodb.yml up -d
```

Nebo:

```bash
docker build -f Dockerfile.mongodb -t network-sim-mongodb .
docker run -d -p 30111:30111 -v mongodb_data:/data/db --name network-sim-mongodb network-sim-mongodb
```

## Možnost 2: Celý stack (MongoDB + Backend + Frontend)

```bash
docker-compose up -d
```

## Připojení k MongoDB

**Connection string:**
```
mongodb://localhost:30111/network-simulator
```

**MongoDB Compass:**
- Host: `localhost`
- Port: `30111`
- Database: `network-simulator`

## Užitečné příkazy

```bash
# Zobrazit běžící kontejnery
docker ps

# Zobrazit logy
docker logs network-sim-mongodb

# Zastavit MongoDB
docker stop network-sim-mongodb

# Spustit znovu
docker start network-sim-mongodb

# Odstranit kontejner
docker rm network-sim-mongodb

# Připojit se do MongoDB shellu
docker exec -it network-sim-mongodb mongosh --port 30111
```

## Testování připojení

```bash
# Z příkazové řádky
mongosh --port 30111

# Test z backendu
# Ujisti se, že v app.module.ts máš:
# MongooseModule.forRoot('mongodb://localhost:30111/network-simulator')
```

## Data persistence

Data jsou uložena v Docker volume `mongodb_data` a přežijí restart kontejneru.

Pro smazání dat:
```bash
docker-compose -f docker-compose.mongodb.yml down -v
```
