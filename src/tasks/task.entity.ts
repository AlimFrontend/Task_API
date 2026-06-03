/**
 * Сущность Task — отображение таблицы tasks в БД (TypeORM Entity).
 * Это модель данных, не контракт API. Для входа/выхода HTTP используются DTO.
 */
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TaskStatus } from './task-status.enum';

@Entity('tasks') // Имя таблицы в SQLite / PostgreSQL
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'varchar',
    default: TaskStatus.TODO, // По ТЗ: статус по умолчанию TODO
  })
  status: TaskStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt: Date; // Обновляется автоматически при save()
}
