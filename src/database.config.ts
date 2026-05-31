import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Task } from './tasks/task.entity';

export const databaseConfig = (): TypeOrmModuleOptions => {
  const dbType = process.env.DB_TYPE ?? 'sqlite';

  if (dbType === 'postgres') {
    return {
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'tasks',
      entities: [Task],
      synchronize: true,
    };
  }

  return {
    type: 'sqljs',
    location: process.env.DATABASE_PATH ?? 'tasks.sqlite',
    autoSave: true,
    entities: [Task],
    synchronize: true,
  };
};
