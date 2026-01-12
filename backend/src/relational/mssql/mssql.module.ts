import { Inject, Injectable, Module, OnModuleDestroy } from '@nestjs/common';
import sql, { type ConnectionPool } from 'mssql';
import { loadAppConfig } from '../../config/app-config';
import { MSSQL_POOL } from './mssql.constants';

@Injectable()
class MssqlPoolLifecycle implements OnModuleDestroy {
  constructor(@Inject(MSSQL_POOL) private readonly pool: ConnectionPool) {}

  async onModuleDestroy() {
    try {
      await this.pool.close();
    } catch {
      // ignore
    }
  }
}

@Module({
  providers: [
    {
      provide: MSSQL_POOL,
      // Read configuration synchronously here to avoid depending on APP_CONFIG provider
      useFactory: (): Promise<ConnectionPool> => {
        const cfg = loadAppConfig();

        if (
          !cfg.mssql.server ||
          !cfg.mssql.user ||
          !cfg.mssql.password ||
          !cfg.mssql.database
        ) {
          throw new Error(
            'MSSQL is not configured. Provide mssql.* in config.json (see config.example.json) or MSSQL_* env vars.',
          );
        }

        const pool = new sql.ConnectionPool({
          server: cfg.mssql.server,
          port: cfg.mssql.port,
          user: cfg.mssql.user,
          password: cfg.mssql.password,
          database: cfg.mssql.database,
          options: {
            encrypt: cfg.mssql.encrypt,
            trustServerCertificate: cfg.mssql.trustServerCertificate,
          },
        });

        return pool.connect();
      },
    },
    MssqlPoolLifecycle,
  ],
  exports: [MSSQL_POOL],
})
export class MssqlModule {}
