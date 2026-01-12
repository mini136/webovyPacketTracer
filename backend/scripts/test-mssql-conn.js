const fs = require('fs');
const path = require('path');
const sql = require('mssql');

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) return env;
  const raw = fs.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const idx = line.indexOf('=');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    env[key] = val;
  });
  return env;
}

(async () => {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const env = loadEnvFile(envPath);

    const config = {
      server: env.MSSQL_SERVER || '127.0.0.1',
      port: Number(env.MSSQL_PORT || 1433),
      user: env.MSSQL_USER || '',
      password: env.MSSQL_PASSWORD || '',
      database: env.MSSQL_DATABASE || '',
      options: {
        encrypt: (env.MSSQL_ENCRYPT || 'true') === 'true',
        trustServerCertificate:
          (env.MSSQL_TRUST_SERVER_CERTIFICATE || 'false') === 'true',
      },
    };

    console.log('Attempting MSSQL connection with:', {
      server: config.server,
      port: config.port,
      user: config.user,
      database: config.database,
      options: config.options,
    });

    const pool = await new sql.ConnectionPool(config).connect();
    console.log('Connection successful.');
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:');
    console.error(err && err.message ? err.message : err);
    if (err && err.originalError)
      console.error(
        'originalError:',
        err.originalError.message || err.originalError,
      );
    process.exit(1);
  }
})();
