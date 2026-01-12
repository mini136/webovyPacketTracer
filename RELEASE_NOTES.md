# Release v0.1.0

Release v0.1.0 includes initial MSSQL-backed labs, seed scripts, frontend tests, and various fixes.

Changelog
- feat(labs): MSSQL-backed labs with Mongo topology attach
- feat(imports): JSON imports into MSSQL tables
- feat(frontend): add labs panel and auth header
- docs: describe MSSQL labs module setup
- zmeny v dockerCompose
- ReadmeZmeny
- databze bug fixes
- feat(mssql): add mssql module updates and main quick-check
- feat(seed): add seed scripts and include public labs
- test(frontend): add Playwright e2e tests and AdminPanel auth fix

Notes
- An initial admin account is created automatically on startup: `admin` / `admin123`. Change immediately in production.
- Seed scripts are in `backend/scripts/`.
