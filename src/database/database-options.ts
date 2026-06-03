/**
 * Общие настройки TypeORM для NestJS и CLI (migration:run).
 * synchronize отключён — схема только через миграции.
 */
import { join } from 'path';
import type { DataSourceOptions } from 'typeorm';
import { Task } from '../tasks/task.entity';

const migrationsGlob = join(__dirname, 'migrations', '*.{js,ts}');

export const buildDataSourceOptions = (): DataSourceOptions => {
  const dbType = process.env.DB_TYPE ?? 'sqlite';

  const shared: Pick<
    DataSourceOptions,
    'entities' | 'migrations' | 'synchronize' | 'migrationsRun' | 'logging'
  > = {
    entities: [Task],
    migrations: [migrationsGlob],
    synchronize: false,
    migrationsRun: process.env.RUN_MIGRATIONS !== 'false',
    logging: process.env.DB_LOGGING === 'true',
  };

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'tasks',
      ...shared,
    };
  }

  return {
    type: 'sqljs',
    location: process.env.DATABASE_PATH ?? 'tasks.sqlite',
    autoSave: true,
    ...shared,
  };
};
