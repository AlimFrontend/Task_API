/**
 * Unit-тесты TasksService — требование ТЗ (хотя бы 1–2 теста).
 * Репозиторий TypeORM замокан: проверяем логику сервиса без реальной БД.
 */
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import type { Repository } from 'typeorm';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

type MockRepository = Partial<Record<keyof Repository<Task>, jest.Mock>>;

const createRepositoryMock = (): MockRepository => ({
  create: jest.fn(),
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  merge: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let repository: MockRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          // Подменяем Repository<Task> на объект с jest.fn()
          provide: getRepositoryToken(Task),
          useValue: createRepositoryMock(),
        },
      ],
    }).compile();

    service = moduleRef.get(TasksService);
    repository = moduleRef.get(getRepositoryToken(Task));
  });

  it('creates a task', async () => {
    const createdTask = {
      title: 'Write tests',
      status: TaskStatus.TODO,
    } as Task;
    const savedTask = { ...createdTask, id: 1 } as Task;

    repository.create?.mockReturnValue(createdTask);
    repository.save?.mockResolvedValue(savedTask);

    await expect(service.create({ title: 'Write tests' })).resolves.toEqual(savedTask);
    expect(repository.create).toHaveBeenCalledWith({ title: 'Write tests' });
    expect(repository.save).toHaveBeenCalledWith(createdTask);
  });

  it('throws NotFoundException when task does not exist', async () => {
    repository.findOne?.mockResolvedValue(null);

    await expect(service.findOne(404)).rejects.toBeInstanceOf(NotFoundException);
    expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 404 } });
  });
});
