/**
 * DTO для POST /tasks — контракт тела запроса при создании.
 * ValidationPipe проверяет декораторы до вызова контроллера.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TaskStatus } from '../task-status.enum';

export class CreateTaskDto {
  @ApiProperty({ example: 'Подготовить отчёт' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty() // title обязателен по ТЗ; после trim пустая строка и пробелы → 400
  title: string;

  @ApiPropertyOptional({ example: 'Собрать данные за квартал' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus) // Только TODO | IN_PROGRESS | DONE
  status?: TaskStatus;
}
