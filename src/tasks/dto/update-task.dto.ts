/**
 * DTO для PATCH /tasks/:id — частичное обновление.
 * Все поля опциональны: клиент может отправить только status или только title.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Обновлённый заголовок' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @IsNotEmpty() // Если title передан — не должен быть пустым после trim
  title?: string;

  @ApiPropertyOptional({ example: 'Новое описание' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
