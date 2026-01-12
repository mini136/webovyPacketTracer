import * as fs from 'fs';
import * as path from 'path';

export type AppConfig = {
  server: {
    port: number;
    corsOrigin: string;
  };
  mongo: {
    uri: string;
  };
  jwt: {
    secret: string;
  };
  mssql: {
    server: string;
    port: number;
    user: string;
    password: string;
    database: string;
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
};

export const APP_CONFIG = Symbol('APP_CONFIG');

const DEFAULT_MONGO_URI = 'mongodb://46.13.167.200:30469/network-simulator';
const DEFAULT_JWT_SECRET = 'your-secret-key-change-this';

function readJsonFile(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, { encoding: 'utf-8' });
  return JSON.parse(raw);
}

function getConfigPath(): string {
  const fromEnv = process.env.APP_CONFIG_PATH?.trim();
  if (fromEnv) return fromEnv;
  return path.join(process.cwd(), 'config.json');
}

export function loadAppConfig(): AppConfig {
  const configPath = getConfigPath();

  const fileConfig = (
    fs.existsSync(configPath)
      ? (readJsonFile(configPath) as Partial<AppConfig>)
      : {}
  );

  const port = Number(process.env.PORT ?? fileConfig.server?.port ?? 3000);
  const corsOrigin =
    process.env.CORS_ORIGIN ??
    fileConfig.server?.corsOrigin ??
    'http://localhost:5173';

  const mongoUri =
    process.env.MONGO_URI ?? fileConfig.mongo?.uri ?? DEFAULT_MONGO_URI;

  const jwtSecret =
    process.env.JWT_SECRET ?? fileConfig.jwt?.secret ?? DEFAULT_JWT_SECRET;

  const mssqlServer =
    process.env.MSSQL_SERVER ?? fileConfig.mssql?.server ?? '';
  const mssqlUser = process.env.MSSQL_USER ?? fileConfig.mssql?.user ?? '';
  const mssqlPassword =
    process.env.MSSQL_PASSWORD ?? fileConfig.mssql?.password ?? '';
  const mssqlDatabase =
    process.env.MSSQL_DATABASE ?? fileConfig.mssql?.database ?? '';
  const mssqlPort = Number(
    process.env.MSSQL_PORT ?? fileConfig.mssql?.port ?? 1433,
  );
  const mssqlEncrypt =
    (process.env.MSSQL_ENCRYPT ?? String(fileConfig.mssql?.encrypt ?? true)) ===
    'true';
  const mssqlTrustServerCertificate =
    (process.env.MSSQL_TRUST_SERVER_CERTIFICATE ??
      String(fileConfig.mssql?.trustServerCertificate ?? false)) === 'true';

  return {
    server: {
      port,
      corsOrigin,
    },
    mongo: {
      uri: mongoUri,
    },
    jwt: {
      secret: jwtSecret,
    },
    mssql: {
      server: mssqlServer,
      port: mssqlPort,
      user: mssqlUser,
      password: mssqlPassword,
      database: mssqlDatabase,
      encrypt: mssqlEncrypt,
      trustServerCertificate: mssqlTrustServerCertificate,
    },
  };
}
