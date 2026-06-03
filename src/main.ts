/**
 * Точка входа приложения.
 * Здесь создаётся экземпляр NestJS и настраивается всё глобальное:
 * валидация, Swagger, порт. Бизнес-логики здесь нет — только bootstrap.
 */
import 'reflect-metadata'; // Нужен для декораторов TypeScript (TypeORM, NestJS)
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Глобальный ValidationPipe — требование ТЗ.
  // Применяется ко всем @Body() / @Query(), где тип — DTO с декораторами class-validator.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет из тела поля, которых нет в DTO
      forbidNonWhitelisted: true, // 400, если клиент прислал лишние поля
      transform: true, // Преобразует типы (например, query page "1" → number 1)
    }),
  );

  // Swagger UI на /api — удобно показать API без Postman (не в ТЗ, но полезно на ревью)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Task API')
    .setDescription('REST API for managing tasks')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // PORT/HOST из env — для Docker, Render и локального запуска
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const host = process.env.HOST ?? '0.0.0.0'; // 0.0.0.0 — слушать все интерфейсы (нужно в контейнере)
  await app.listen(port, host);
}

void bootstrap();
