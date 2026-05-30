# NestJS Task API

REST API для управления задачами на NestJS, TypeScript, TypeORM и SQLite. Валидация DTO, глобальный `ValidationPipe`, middleware для логирования запросов.

## Требования

- Node.js 22+
- npm
- Docker и Docker Compose (для запуска в контейнере)

## Установка

```bash
npm install
```

## Запуск локально

```bash
npm run start:dev
```

API доступен по адресу `http://localhost:3000`. Данные сохраняются в файл `tasks.sqlite`.

## Сборка

```bash
npm run build
npm start
```

## Запуск в Docker

```bash
docker compose up --build
```

База SQLite хранится в Docker-томе `tasks-data`.

## Эндпоинты

| Метод    | Путь            | Описание                                                                               |
| -------- | --------------- | -------------------------------------------------------------------------------------- |
| `GET`    | `/tasks?page=1` | Список задач с пагинацией (10 на страницу), сортировка по дате создания, новые первыми |
| `GET`    | `/tasks/:id`    | Одна задача по `id` (404, если не найдена)                                             |
| `POST`   | `/tasks`        | Создание задачи                                                                        |
| `PATCH`  | `/tasks/:id`    | Частичное обновление задачи                                                            |
| `DELETE` | `/tasks/:id`    | Удаление задачи                                                                        |

### Пример создания задачи

```json
{
  "title": "Подготовить отчёт",
  "description": "Собрать данные за квартал",
  "status": "TODO"
}
```

Допустимые статусы: `TODO`, `IN_PROGRESS`, `DONE`.

Поле `title` обязательно. `description` — необязательно. По умолчанию статус `TODO`.

## Тесты

```bash
npm test
```
