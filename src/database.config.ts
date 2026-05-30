import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Task } from './tasks/task.entity';

export const databaseConfig = (): TypeOrmModuleOptions => ({
  type: 'sqljs',
  location: process.env.DATABASE_PATH ?? 'tasks.sqlite',
  autoSave: true,
  entities: [Task],
  synchronize: true,
});
