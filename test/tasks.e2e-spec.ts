/**
 * E2e-тесты — полный HTTP-цикл через supertest.
 * Поднимается реальное приложение (AppModule) + ValidationPipe, как в main.ts.
 * БД: отдельный файл test-e2e.sqlite, чтобы не трогать dev-данные.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { TaskStatus } from '../src/tasks/task-status.enum';

describe('Tasks (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    process.env.DATABASE_PATH = 'test-e2e.sqlite';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    // Те же настройки pipe, что в main.ts — иначе e2e не отражают прод-поведение
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST → GET → PATCH → DELETE flow', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'E2E task', description: 'Test description' })
      .expect(201);

    const taskId = createResponse.body.id as number;
    expect(createResponse.body.title).toBe('E2E task');
    expect(createResponse.body.status).toBe(TaskStatus.TODO);

    await request(app.getHttpServer())
      .get(`/tasks/${taskId}`)
      .expect(200)
      .expect((response) => {
        expect(response.body.id).toBe(taskId);
        expect(response.body.title).toBe('E2E task');
      });

    await request(app.getHttpServer())
      .patch(`/tasks/${taskId}`)
      .send({ status: TaskStatus.IN_PROGRESS, title: 'Updated E2E task' })
      .expect(200)
      .expect((response) => {
        expect(response.body.status).toBe(TaskStatus.IN_PROGRESS);
        expect(response.body.title).toBe('Updated E2E task');
      });

    await request(app.getHttpServer()).delete(`/tasks/${taskId}`).expect(204);

    await request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404);
  });

  it('returns 400 when title is empty or whitespace', async () => {
    await request(app.getHttpServer()).post('/tasks').send({ title: '' }).expect(400);

    await request(app.getHttpServer()).post('/tasks').send({ title: '   ' }).expect(400);
  });

  it('returns 404 for unknown task id', async () => {
    await request(app.getHttpServer()).get('/tasks/999999').expect(404);
  });
});
