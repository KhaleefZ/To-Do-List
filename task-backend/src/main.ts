import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation for DTOs
  app.useGlobalPipes(new ValidationPipe());
  
  // Enable CORS for mobile connectivity
  app.enableCors();

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('Backend API for the React Native Todo/Task Manager app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  await app.listen(3000, '0.0.0.0');
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger docs available at: http://localhost:3000/api`);
}
bootstrap();