# Testing guide for the database tester

This file explains how a tester (no prior project knowledge) can run the project locally and test the database-related features (MongoDB + MSSQL). Keep this short and actionable.

Prerequisites
- Node.js 18+ and npm
- Access to the project repository (this repo)
- MongoDB and MSSQL reachable on the network (or run via Docker if provided)

Quick checklist
1. Open a terminal in the project root.
2. Start the backend (it will create an initial admin user if none exists):

```powershell
npm --prefix "./backend" install
npm --prefix "./backend" run start:dev
```

3. Start the frontend (optional for UI verification):

```powershell
npm --prefix "./frontend" install
npm --prefix "./frontend" run dev
```

How to verify DB connections
- MSSQL: The backend reads MSSQL configuration from `backend/config.json` or environment variables (`MSSQL_*`). To run a quick test, use the provided helper:

```powershell
node backend/scripts/test-mssql-conn.js
```

- MongoDB: The backend uses `backend/config.json` (key `mongo.uri`) or `MONGO_URI` env var. To inspect topologies/devices after seeding:

```powershell
# Use the seed script to insert example labs & topologies
node backend/scripts/seed-labs.js

# Make seeded labs public (optional)
node backend/scripts/make-labs-public.js

# Seed device connections/configs (optional)
node backend/scripts/seed-lab-connections.js
```

Testing endpoints
- Public labs (GET /labs): must return seeded labs (public or owned). Use curl or Postman:

```bash
curl http://localhost:3000/labs
```

- Auth: register a new user via `POST /auth/register` with JSON `{ "username": "tester", "email": "t@example.com", "password": "pass123" }`. Then `POST /auth/login` to receive a bearer token.

- After login, the frontend stores the token in local storage under `auth-storage` and will use it automatically.

Notes and troubleshooting
- If `/labs` returns empty: ensure backend is running and that MSSQL + Mongo connections are configured correctly in `backend/config.json` or environment.
- Default initial admin account (on first run): `admin` / `admin123`. Change immediately in production.
- Avoid committing `backend/config.json` with secrets; use env variables in CI.

Contact
- If any test fails, collect the backend logs (terminal where `start:dev` runs) and copy the exact error message to the issue.
