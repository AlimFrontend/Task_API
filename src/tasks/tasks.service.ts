/**
 * Сервисный слой — вся бизнес-логика работы с задачами.
 * Контроллер только маршрутизирует HTTP; здесь — работа с TypeORM Repository.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';

/** Размер страницы по ТЗ: 10 задач на страницу */
const PAGE_SIZE = 10;

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) // Nest внедряет репозиторий, зарегистрированный в TasksModule
    private readonly tasksRepository: Repository<Task>,
  ) {}

  /**
   * GET /tasks — список с пагинацией.
   * findAndCount: одним запросом и данные, и total для метаданных ответа.
   * order createdAt DESC — новые задачи первыми (требование ТЗ).
   */
  async findAll(page = 1): Promise<{ data: Task[]; page: number; limit: number; total: number }> {
    const [data, total] = await this.tasksRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

    return {
      data,
      page,
      limit: PAGE_SIZE,
      total,
    };
  }

  /** GET /tasks/:id — одна задача или 404 */
  async findOne(id: number): Promise<Task> {
    const task = await this.tasksRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} was not found`);
    }

    return task;
  }

  /** POST /tasks — создание из DTO (поля уже провалидированы ValidationPipe) */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create(createTaskDto);

    return this.tasksRepository.save(task);
  }

  /**
   * PATCH /tasks/:id — частичное обновление.
   * merge накладывает только переданные поля из DTO на существующую сущность.
   */
  async update(id: number, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(id);
    const updatedTask = this.tasksRepository.merge(task, updateTaskDto);

    return this.tasksRepository.save(updatedTask);
  }

  /** DELETE /tasks/:id — сначала проверяем существование, потом remove */
  async remove(id: number): Promise<void> {
    const task = await this.findOne(id);

    await this.tasksRepository.remove(task);
  }
}
