/**
 * Конфиг TypeORM для NestJS (AppModule).
 * Логика в database/database-options.ts — общая с CLI миграций.
 */
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './database/database-options';

export const databaseConfig = (): TypeOrmModuleOptions => buildDataSourceOptions();
