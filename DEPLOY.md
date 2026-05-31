# Деплой NestJS Task API

## Render (рекомендуется для демо)

Сайт: [https://render.com](https://render.com)  
Документация: [Deploy for Free](https://render.com/docs/free)

### Стоимость

| План        | Цена                  | Для чего                                                                                       |
| ----------- | --------------------- | ---------------------------------------------------------------------------------------------- |
| **Free**    | $0                    | Демо и тест. Сервис засыпает после ~15 мин без запросов; первый ответ после сна ~30–60 с.     |
| **Starter** | **~$7/мес** за сервис | Всегда включён, без холодного старта.                                                          |

> **SQLite на Render:** файл БД на временном диске — данные могут пропасть после нового деплоя. Для тестового задания обычно достаточно; для продакшена лучше PostgreSQL.

### Шаги

1. [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Подключите репозиторий с проектом.
3. Настройки (или Blueprint из `render.yaml`):

| Поле              | Значение                                     |
| ----------------- | -------------------------------------------- |
| **Runtime**       | Node                                         |
| **Build Command** | `npm install --include=dev && npm run build` |
| **Start Command** | `npm start`                                  |
| **Instance Type** | Free                                         |

4. **Environment Variables:**

| Key             | Value               |
| --------------- | ------------------- |
| `HOST`          | `0.0.0.0`           |
| `NODE_ENV`      | `production`        |
| `DATABASE_PATH` | `/tmp/tasks.sqlite` |

`PORT` Render подставит сам.

5. **Create Web Service** → дождитесь деплоя.
6. Проверка:

```bash
curl https://ВАШ-СЕРВИС.onrender.com/tasks
curl -X POST https://ВАШ-СЕРВИС.onrender.com/tasks \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Задача с Render\"}"
```

### Blueprint

В корне лежит `render.yaml` — при создании сервиса можно выбрать **Blueprint**.

---

## Туннель с локального ПК

1. Запустите API: `npm run start:dev`
2. Поднимите туннель:

```bash
ngrok http 3000
# или
cloudflared tunnel --url http://localhost:3000
```

Минусы: URL меняется при перезапуске; ПК должен быть включён.

---

## VPS (Docker)

1. Скопируйте проект на сервер (`git clone` или `scp`).
2. На сервере:

```bash
cd nestjs-task-api
docker compose up -d --build
```

3. Откройте порт **3000** в файрволе.
4. Проверка: `http://ВАШ_IP:3000/tasks`

Для HTTPS и домена — nginx или Caddy с Let's Encrypt (прокси на `localhost:3000`).

> **Важно:** API без авторизации — не оставляйте в открытом доступе без необходимости.
