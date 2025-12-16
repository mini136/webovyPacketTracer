import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AuthService } from './services/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe());

  // Create initial admin user
  const authService = app.get(AuthService);
  await authService.createInitialAdmin();

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Backend running on http://localhost:3000');
}
bootstrap();
