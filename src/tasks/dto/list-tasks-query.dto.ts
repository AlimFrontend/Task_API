/**
 * DTO для query-параметров GET /tasks?page=1.
 * @Type(() => Number) нужен при transform: true — иначе page приходит строкой "1".
 */
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListTasksQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1) // Страница с 1, не с 0
  page = 1;
}
