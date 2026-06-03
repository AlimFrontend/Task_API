# NestJS Task API

REST API для управления задачами: NestJS, TypeScript, TypeORM, SQLite (локально) или PostgreSQL (Docker).

**Подготовка к ревью с лидом:**
- [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) — архитектура, файлы, сценарий разговора
- [INTERVIEW_QA.md](./INTERVIEW_QA.md) — вопросы сеньора и готовые ответы

## Быстрый старт

```bash
npm install
npm run start:dev
```

API: `http://localhost:3000`  
Swagger: `http://localhost:3000/api`  
БД по умолчанию: файл `tasks.sqlite` в корне проекта.

## Docker (PostgreSQL)

```bash
docker compose up --build
```

API на порту **3000**, база — PostgreSQL. Для SQLite в Docker:

```bash
docker compose --profile sqlite up api-sqlite --build
```

## Эндпоинты

| Метод    | Путь            | Описание                                      |
| -------- | --------------- | --------------------------------------------- |
| `GET`    | `/tasks?page=1` | Список задач (10 на страницу, новые первыми)  |
| `GET`    | `/tasks/:id`    | Одна задача (404, если не найдена)            |
| `POST`   | `/tasks`        | Создание задачи                               |
| `PATCH`  | `/tasks/:id`    | Частичное обновление                          |
| `DELETE` | `/tasks/:id`    | Удаление (204)                                |

Статусы: `TODO`, `IN_PROGRESS`, `DONE`. Поле `title` обязательно.

### Примеры curl

```bash
# Список задач
curl http://localhost:3000/tasks?page=1

# Создание
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Подготовить отчёт\",\"description\":\"Квартал\",\"status\":\"TODO\"}"

# Получение по id
curl http://localhost:3000/tasks/1

# Обновление
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"IN_PROGRESS\"}"

# Удаление
curl -X DELETE http://localhost:3000/tasks/1
```

## Переменные окружения

| Переменная       | По умолчанию   | Описание                          |
| ---------------- | -------------- | --------------------------------- |
| `HOST`           | `0.0.0.0`      | Хост сервера                      |
| `PORT`           | `3000`         | Порт                              |
| `DB_TYPE`        | `sqlite`       | `sqlite` или `postgres`           |
| `DATABASE_PATH`  | `tasks.sqlite` | Путь к SQLite (при `DB_TYPE=sqlite`) |
| `DB_HOST`        | `localhost`    | Хост PostgreSQL                   |
| `DB_PORT`        | `5432`         | Порт PostgreSQL                   |
| `DB_USERNAME`    | `postgres`     | Пользователь PostgreSQL           |
| `DB_PASSWORD`    | `postgres`     | Пароль PostgreSQL                 |
| `DB_NAME`        | `tasks`        | Имя базы PostgreSQL               |
| `RUN_MIGRATIONS` | `true`         | `false` — не применять миграции при старте |
| `DB_LOGGING`     | —              | `true` — SQL-логи TypeORM         |

## Миграции

Схема БД управляется **миграциями** (`synchronize` отключён). При старте API pending-миграции применяются автоматически (`migrationsRun`).

```bash
# Вручную (если нужно до старта приложения)
npm run migration:run

# Статус миграций
npm run migration:show

# Откат последней миграции
npm run migration:revert
```

Файлы: `src/database/migrations/`. Конфиг CLI: `src/database/data-source.ts`.

Новая миграция после изменения entity:

```bash
# Сгенерировать по diff entity ↔ БД (нужна поднятая БД с актуальной схемой)
npm run migration:generate -- src/database/migrations/ИмяМиграции
```

Если после старого `synchronize` таблица `tasks` уже есть — первая миграция её не пересоздаёт.

## Сборка и качество кода

```bash
npm run build
npm run lint
npm run format
npm test          # unit + e2e
npm run test:unit
npm run test:e2e
```

## Деплой

Подробные инструкции: [DEPLOY.md](./DEPLOY.md) (Render, VPS, туннели).

## Стек

- NestJS 11, TypeORM, миграции, class-validator
- Глобальный `ValidationPipe`, middleware логирования запросов
- Unit-тесты (`TasksService`) + e2e-тесты (supertest)
- CI: GitHub Actions (lint, test, build)
