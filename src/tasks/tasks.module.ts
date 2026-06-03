/**
 * Feature-модуль «Задачи».
 * Группирует всё, что относится к домену Task: контроллер, сервис, репозиторий.
 * AppModule только импортирует TasksModule — так проще масштабировать проект.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  // forFeature регистрирует Repository<Task> для внедрения в TasksService
  imports: [TypeOrmModule.forFeature([Task])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
