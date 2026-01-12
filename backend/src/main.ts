import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './services/auth.service';
import { loadAppConfig } from './config/app-config';
async function bootstrap() {
  const cfg = loadAppConfig();
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
