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

По умолчанию сервер слушает `0.0.0.0` (все сетевые интерфейсы). Переменные: `HOST`, `PORT`.

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

## Доступ из интернета

`localhost` виден только на вашем ПК. Чтобы API открывался снаружи, нужен **публичный адрес** (туннель или сервер в облаке).

### Вариант 1: Туннель с вашего ПК (быстро, для демо)

1. Запустите API:

```bash
npm run start:dev
```

2. В другом терминале поднимите туннель (один из сервисов):

**ngrok:**

```bash
ngrok http 3000
```

**Cloudflare Tunnel:**

```bash
cloudflared tunnel --url http://localhost:3000
```

В выводе появится URL вида `https://xxxx.ngrok-free.app` — его можно отдавать другим людям. Пока туннель и API запущены, сервис доступен из интернета.

Минусы: бесплатные туннели часто меняют URL при перезапуске; ПК должен быть включён.

### Вариант 2: VPS в интернете (стабильно)

Подойдёт любой VPS (Timeweb, Selectel, Hetzner, DigitalOcean и т.п.) с Linux и Docker.

1. Скопируйте проект на сервер (git clone или `scp`).
2. На сервере:

```bash
cd nestjs-task-api
docker compose up -d --build
```

3. Откройте порт **3000** в файрволе облака (Security Group / UFW).
4. Проверка: `http://ВАШ_IP:3000/tasks`

Для постоянного домена и HTTPS поставьте перед API **nginx** или **Caddy** с Let's Encrypt (прокси на `localhost:3000`).

### Вариант 3: Render (рекомендуется для демо в интернете)

Сайт: [https://render.com](https://render.com)  
Документация: [Deploy for Free](https://render.com/docs/free)

#### Сколько стоит

| План        | Цена                  | Для чего                                                                                                                                                   |
| ----------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Free**    | $0                    | Демо, тест, показать проверяющему. Сервис **засыпает** после ~15 мин без запросов, первый ответ после сна ~30–60 с. До **750 часов** в месяц на workspace. |
| **Starter** | **~$7/мес** за сервис | Всегда включён, без «холодного старта». Для нормального публичного API.                                                                                    |

Карта для Free не обязательна. HTTPS и домен вида `https://nestjs-task-api.onrender.com` — бесплатно.

> **SQLite на Render:** файл БД живёт на временном диске. После **нового деплоя** или пересоздания сервиса данные могут пропасть. Для тестового задания обычно достаточно; для продакшена лучше PostgreSQL на Render.

#### Что нужно заранее

1. Аккаунт на Render (GitHub-логин удобнее всего).
2. Код в **GitHub** / GitLab / Bitbucket (Render тянет репозиторий сам).

#### Шаги в Render Dashboard

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Подключите репозиторий с проектом `nestjs-task-api`.
3. Настройки (если не подхватит `render.yaml` автоматически):

| Поле              | Значение                       |
| ----------------- | ------------------------------ |
| **Runtime**       | Node                           |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npm start`                    |
| **Instance Type** | Free (или Starter за $7)       |

4. **Environment Variables** (вкладка Environment):

| Key        | Value        |
| ---------- | ------------ |
| `HOST`     | `0.0.0.0`    |
| `NODE_ENV` | `production` |

`PORT` Render подставит сам — в коде уже читается из `process.env.PORT`.

5. **Create Web Service** → дождитесь зелёного деплоя.
6. Откройте URL сервиса, например: `https://nestjs-task-api.onrender.com/tasks`

#### Blueprint (автоконфиг)

В корне репозитория лежит `render.yaml`. При создании сервиса можно выбрать **Blueprint** и указать этот файл — поля заполнятся сами.

#### Проверка после деплоя

```bash
curl https://ВАШ-СЕРВИС.onrender.com/tasks
curl -X POST https://ВАШ-СЕРВИС.onrender.com/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Задача с Render\"}"
```

#### Если сборка падает

- В логах Build смотрите ошибку `better-sqlite3` — на Render обычно собирается; при проблемах в Support пишут про native modules.
- Убедитесь, что в репозитории есть `package-lock.json` и Node **22** (файл `.node-version`).

> **Важно:** API без авторизации — не оставляйте надолго в открытом доступе без необходимости.

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
