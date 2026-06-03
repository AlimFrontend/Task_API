/**
 * Корневой модуль приложения.
 * Собирает всё вместе: БД, feature-модули, middleware, корневой контроллер.
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { databaseConfig } from './database.config';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    // Подключение БД один раз на всё приложение (конфиг в database.config.ts)
    TypeOrmModule.forRoot(databaseConfig()),
    // Feature-модуль с задачами — изолирует REST /tasks
    TasksModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  /**
   * Регистрация middleware — требование ТЗ (логирование запросов).
   * forRoutes('*') — на все маршруты, включая /tasks и /
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
