import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './services/auth.service';
import { loadAppConfig } from './config/app-config';
import sql from 'mssql';

async function bootstrap() {
  const cfg = loadAppConfig();
  // Quick MSSQL connectivity check from this process (before Nest modules initialize)
  try {
    const testPool = await new sql.ConnectionPool({
      server: cfg.mssql.server,
      port: cfg.mssql.port,
      user: cfg.mssql.user,
      password: cfg.mssql.password,
      database: cfg.mssql.database,
      options: {
        encrypt: cfg.mssql.encrypt,
        trustServerCertificate: cfg.mssql.trustServerCertificate,
      },
    }).connect();
    console.log('MSSQL quick check: connection successful (pre-app).');
    await testPool.close();
  } catch (err) {
    console.error('MSSQL quick check: connection FAILED (pre-app):', err && err.message ? err.message : err);
  }
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: cfg.server.corsOrigin,
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Create initial admin user
  const authService = app.get(AuthService);
  await authService.createInitialAdmin();

  await app.listen(cfg.server.port);
  console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();
