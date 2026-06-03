# Вопросы и ответы для ревью проекта (сеньор, ~10 лет опыта)

Шпаргалка по проекту **nestjs-task-api**. Ответы привязаны к **вашему коду** — можно отвечать своими словами, опираясь на формулировки ниже.

---

## Как пользоваться

- Вопросы сгруппированы по темам.
- **Жирный текст** в ответе — ключевая мысль, которую стоит сказать вслух.
- Если спросят «что бы улучшил» — честно назови trade-off и как сделал бы в проде (раздел 12).

---

## 1. Общие вопросы о проекте

### Расскажи про проект в двух минутах.

**Ответ:** REST API на NestJS для CRUD задач: список с пагинацией (10, сортировка по `createdAt` DESC), получение по id, создание, частичное обновление, удаление. Стек: TypeScript, TypeORM, SQLite локально / PostgreSQL в Docker. Есть валидация DTO, глобальный `ValidationPipe`, middleware логирования, unit + e2e тесты, CI, Swagger на `/api`. Сделано по тестовому ТЗ, с небольшими улучшениями для демо и ревью.

---

### Почему NestJS, а не Express «голый»?

**Ответ:** ТЗ требовало NestJS. Плюс из коробки: модульность, DI, декораторы, pipes/guards/filters, единый стиль для команды. Для маленького API Express быстрее поднять, но Nest масштабируется структурой — controller/service/module. На тестовом задании это показывает знание фреймворка, который часто используют в enterprise.

---

### Что бы ты сделал иначе, если бы это был прод?

**Ответ (кратко):**
- `synchronize: false` + миграции TypeORM;
- `ConfigModule` + валидация env (Joi/Zod);
- авторизация (JWT/API key), rate limit, helmet;
- структурированные логи (Pino) вместо `console.log`;
- health/readiness endpoints;
- cursor-based пагинация при больших объёмах;
- отдельный слой маппинга Entity → Response DTO (не отдавать entity напрямую).

---

### Где граница «достаточно для ТЗ» и «перебор»?

**Ответ:** ТЗ — CRUD + валидация + Docker + 1–2 unit-теста. CQRS, микросервисы, Kafka — перебор. Разумные плюсы: e2e, ESLint, CI, Swagger — показывают инженерную культуру без раздувания кодовой базы. Отдельный Repository-интерфейс поверх TypeORM для одной сущности — уже лишнее.

---

## 2. Архитектура и слои

### Объясни слои: middleware → pipe → controller → service → repository.

**Ответ:** Запрос идёт сверху вниз:
1. **Middleware** (`RequestLoggerMiddleware`) — логирование, до бизнес-логики.
2. **ValidationPipe** — проверка DTO (`class-validator`), отсечение лишних полей.
3. **Controller** — HTTP: маршрут, статус, вызов сервиса.
4. **Service** — правила: пагинация, 404, merge при PATCH.
5. **Repository (TypeORM)** — работа с БД.

Ответ идёт обратно. Так проще тестировать сервис отдельно и менять БД без переписывания контроллера.

---

### Почему бизнес-логика в сервисе, а не в контроллере?

**Ответ:** Контроллер должен оставаться тонким — только HTTP-контракт. Сервис можно покрыть unit-тестами без HTTP. Если завтра появится CLI или очередь — логика уже в `TasksService`, не копируется из контроллера.

---

### Почему нет отдельного Repository-класса (свой интерфейс)?

**Ответ:** TypeORM уже даёт `Repository<Task>`. Для одной сущности и тестового объёма обёртка `ITasksRepository` — лишняя абстракция. В проде при смене ORM или сложных запросах — имеет смысл вынести интерфейс и реализацию.

---

### Почему нет CQRS / Event Sourcing?

**Ответ:** Не требовалось ТЗ, домен простой (одна сущность, синхронный CRUD). CQRS оправдан при разной нагрузке на чтение/запись и сложных доменах. Здесь — over-engineering.

---

### Зачем DTO, если есть Entity?

**Ответ:** **Entity** — модель БД (таблица `tasks`). **DTO** — контракт API: что клиент может прислать/получить. Разделение: не светим внутренние поля БД, валидируем только вход, Swagger описывает DTO. Сейчас в ответе отдаётся entity целиком — для ТЗ ок; в проде лучше `TaskResponseDto`.

---

### Зачем feature-модуль `TasksModule`?

**Ответ:** Изоляция домена «задачи»: controller, service, entity, `TypeOrmModule.forFeature([Task])` в одном месте. `AppModule` только собирает инфраструктуру (БД, middleware) и импортирует модуль. При росте проекта добавятся `UsersModule`, `AuthModule` без раздувания корня.

---

## 3. NestJS: DI, модули, lifecycle

### Что такое Dependency Injection в твоём проекте?

**Ответ:** Nest создаёт экземпляры классов и подставляет зависимости в конструктор. Например, `TasksService` получает `Repository<Task>` через `@InjectRepository(Task)` — не создаём репозиторий вручную. В тестах подменяем через `getRepositoryToken(Task)` и mock. Это упрощает тестирование и связность.

---

### Чем `TypeOrmModule.forRoot` отличается от `forFeature`?

**Ответ:**
- **`forRoot`** в `AppModule` — одно подключение к БД на всё приложение (`database.config.ts`).
- **`forFeature([Task])`** в `TasksModule` — регистрирует репозиторий для сущности `Task` в этом модуле.

---

### Почему middleware в `AppModule`, а не в `TasksModule`?

**Ответ:** Логирование нужно на все маршруты (`*`), включая `GET /` и `/api`. Это cross-cutting concern уровня приложения. Если бы логировали только `/tasks` — можно было бы в `TasksModule.configure`.

---

### Что такое `ParseIntPipe` на `:id`?

**Ответ:** Параметр `id` из URL приводится к числу. Если передали `abc` — Nest вернёт **400 Bad Request** до вызова сервиса. Без pipe строка ушла бы в `findOne` и дала бы странное поведение.

---

### Почему `@HttpCode(204)` на DELETE?

**Ответ:** По REST успешное удаление часто без тела ответа — **204 No Content**. По умолчанию Nest на DELETE мог бы отдать 200. Явный код — осознанный контракт API.

---

### Guards, Interceptors, Filters — почему не использовал?

**Ответ:** ТЗ не требовало auth и кастомных ошибок. `NotFoundException` обрабатывается встроенным exception filter Nest → 404 JSON. В проде: `JwtAuthGuard`, `LoggingInterceptor`, глобальный `ExceptionFilter` для единого формата ошибок.

---

## 4. ValidationPipe и DTO

### Зачем глобальный `ValidationPipe`?

**Ответ:** Требование ТЗ. Один раз в `main.ts` — все DTO с декораторами `class-validator` проверяются автоматически. Не дублируем валидацию в каждом методе контроллера.

---

### Что делают `whitelist`, `forbidNonWhitelisted`, `transform`?

**Ответ:**
- **`whitelist`** — убирает из body поля, которых нет в DTO (защита от mass assignment).
- **`forbidNonWhitelisted`** — если клиент прислал лишнее поле → **400** (строже, чем молча вырезать).
- **`transform`** — приводит типы: query `page="2"` → `number`, плюс работает `@Transform` на полях DTO.

---

### Почему `@IsNotEmpty()` и `@Transform(trim)` на `title`?

**Ответ:** ТЗ: title обязателен. `@MinLength(1)` пропускает строку из пробелов. Trim + `@IsNotEmpty()` — пустая и «пробельная» строка → 400. E2e это проверяет.

---

### Почему в PATCH все поля опциональны?

**Ответ:** PATCH — частичное обновление. Клиент может отправить только `{ "status": "DONE" }`. В сервисе `merge` накладывает только переданные поля на существующую entity.

---

### Почему `UpdateTaskDto` с `@IsOptional()` + `@IsNotEmpty()` на title?

**Ответ:** Поле необязательно «присутствовать» в JSON. Но если `title` передали — после trim он не должен быть пустым. Иначе можно было бы «обнулить» заголовок пробелами.

---

### DTO в e2e — ты дублируешь ValidationPipe из `main.ts`. Зачем?

**Ответ:** E2e поднимает приложение через `Test.createTestingModule`, без вызова `bootstrap()` из `main.ts`. Pipe нужно повесить вручную — иначе тесты не отражают реальное поведение API. В идеале вынести фабрику `createApp()` в общий helper.

---

## 5. TypeORM, база данных

### Почему TypeORM, а не Prisma?

**Ответ:** В ТЗ — «TypeORM или Prisma на выбор». TypeORM хорошо интегрируется с Nest (`@nestjs/typeorm`), декораторы entity близки к стилю Nest. Prisma удобнее для миграций и типобезопасных запросов — другой trade-off.

---

### Что такое `synchronize`? У тебя как сейчас?

**Ответ:** **`synchronize: false`** — схема только через миграции в `src/database/migrations/`. При старте API `migrationsRun: true` применяет pending-миграции. CLI: `npm run migration:run`. Раньше был auto-sync для ТЗ; заменил на миграции — безопаснее для продакшена и изменений entity.

---

### Почему две БД: SQLite и PostgreSQL?

**Ответ:** ТЗ: PostgreSQL или SQLite. SQLite + `sql.js` — нулевая настройка локально и на Render. PostgreSQL в `docker-compose` — ближе к «настоящему» продакшену, показываю переключение через `DB_TYPE` в `database.config.ts`.

---

### Почему `sql.js`, а не `better-sqlite3`?

**Ответ:** `better-sqlite3` — native-модуль, на CI/Render возможны проблемы сборки под Linux. `sql.js` — чистый JS, предсказуемый деплой. Минус: производительность и то, что БД в памяти с `autoSave` — для демо ок.

---

### Что будет с данными на Render с SQLite?

**Ответ:** Файл в `/tmp` — при redeploy/рестарте может обнулиться. Для демо ТЗ достаточно. Для постоянных данных — PostgreSQL на Render или внешний managed DB.

---

### Объясни `findAndCount` в `findAll`.

**Ответ:** Один запрос (или два в зависимости от драйвера) возвращает записи страницы и **общее** `total` для UI пагинации. `skip = (page-1)*10`, `take = 10`, `order: { createdAt: 'DESC' }` — по ТЗ.

---

### Offset-пагинация vs cursor — что выбрал и почему?

**Ответ:** Offset (`page` + `skip/take`) — по ТЗ, просто объяснить. **Минус:** на больших offset (страница 10 000) БД тормозит. **Cursor** (where id < lastId) — лучше для лент в проде. Для тысяч задач offset нормален.

---

### Почему `merge` + `save` в update, а не `update(id, dto)`?

**Ответ:** `merge` загружает entity в контекст, применяет частичные поля, `save` триггерит `@UpdateDateColumn`. Альтернатива — `repository.update(id, dto)` без загрузки — быстрее, но не вызовет все хуки entity и не вернёт полный объект без второго SELECT.

---

### Индексы на `createdAt` — есть?

**Ответ:** В entity явно не объявлял. При росте данных — `@Index()` на `createdAt` для сортировки списка. Сеньор может спросить — покажи, что понимаешь проблему N+1 и full scan.

---

### Транзакции используешь?

**Ответ:** Нет — операции одиночные (один save/remove). Если бы «создать задачу + запись в audit_log» — `QueryRunner` или `@Transactional()`. Для текущего CRUD не нужно.

---

## 6. REST API и HTTP

### Почему 201 на POST без явного `@HttpCode`?

**Ответ:** Nest по умолчанию для `@Post()` возвращает **201 Created**. Для DELETE явно указал 204.

---

### Почему формат списка `{ data, page, limit, total }`, а не просто массив?

**Ответ:** ТЗ формат не фиксировало. Метаданные пагинации удобны фронту (сколько страниц, всего записей). Можно обсудить: обёртка vs заголовки `X-Total-Count`.

---

### Идемпотентность DELETE и PATCH?

**Ответ:** DELETE идемпотентен: второй DELETE по несуществующему id → 404 (у нас после `findOne`). Строгий REST: повторный DELETE мог бы быть 204. PATCH не идемпотентен по смыслу. Для ТЗ текущее поведение приемлемо.

---

### Версионирование API (`/v1/tasks`)?

**Ответ:** Не делал — объём ТЗ маленький. В проде — префикс версии или заголовок `Accept-Version`.

---

## 7. Тестирование

### Какие тесты есть и зачем оба типа?

**Ответ:**
- **Unit** (`tasks.service.spec.ts`) — сервис с mock репозитория: create, findOne 404. Быстро, изолированно.
- **E2e** (`test/tasks.e2e-spec.ts`) — реальный HTTP через supertest, ValidationPipe, БД в `test-e2e.sqlite`: полный CRUD, 400 на пустой title, 404.

Unit не поймает ошибку маршрута или pipe; e2e медленнее — дополняют друг друга.

---

### Почему mock репозитория, а не testcontainers PostgreSQL?

**Ответ:** Для unit — скорость и фокус на логике сервиса. Testcontainers — для integration/e2e при критичной БД-специфике. У нас e2e уже с реальной sql.js БД.

---

### Покрытие не 100% — норм?

**Ответ:** По ТЗ достаточно 1–2 unit-тестов. Не покрыты: `findAll`, `update`, `remove` в unit — можно добавить. E2e покрывает happy path CRUD. В проде — смотреть на критичные ветки, не гнаться за 100%.

---

### Почему `supertest` в devDependencies, но используется в e2e?

**Ответ:** E2e — dev-time проверка, в production bundle не попадает. Стандартная практика.

---

## 8. Безопасность

### API без авторизации — это ок?

**Ответ:** Для тестового задания — да. В проде — JWT/session, проверка прав на задачу, HTTPS. Упоминаю в README/DEPLOY: не держать открытым API в интернете без нужды.

---

### Защита от SQL injection?

**Ответ:** TypeORM использует параметризованные запросы. Сырой SQL в проекте нет. Риск — если писать `.query('...' + userInput)` — так не делаем.

---

### XSS, CORS?

**Ответ:** API отдаёт JSON, не рендерит HTML — XSS минимален. CORS не настраивал — при фронте на другом домене нужен `app.enableCors()`. Helmet — для заголовков безопасности в проде.

---

### Rate limiting?

**Ответ:** Нет. В проде — `@nestjs/throttler` или nginx limit_req.

---

## 9. DevOps, Docker, CI

### Как устроен Dockerfile?

**Ответ:** Multi-stage: `deps` (npm ci) → `build` (tsc) → `production` (только prod-зависимости + `dist`). Меньший образ, без devDependencies в рантайме.

---

### Зачем `depends_on` + healthcheck у Postgres в compose?

**Ответ:** API стартует после готовности БД, иначе первые запросы могут упасть с connection refused.

---

### Почему CI падал на `npm ci`?

**Ответ:** Lockfile собирали на Windows — не попали Linux-only optional dependencies (`@emnapi/*` для wasm). Решение: пересобрать lock с учётом Linux или генерировать lock в CI/Linux. `npm ci` требует строгого совпадения lock и `package.json`.

---

### Что проверяет GitHub Actions?

**Ответ:** `npm ci` → `lint` → `test` (unit + e2e) → `build`. Базовый quality gate перед merge.

---

### Почему сборка через `tsc`, а не `nest build`?

**Ответ:** Проект без `@nestjs/cli` — меньше зависимостей, для одного API достаточно. `nest build` обёртка над компилятором + webpack опции. Можно добавить CLI за минуту — не принципиально.

---

## 10. TypeScript и качество кода

### `strict: true` в tsconfig — зачем?

**Ответ:** Строгая проверка типов — меньше runtime-ошибок. `strictPropertyInitialization: false` — часто отключают для entity с декораторами TypeORM, иначе ругается на поля без инициализации в конструкторе.

---

### Почему entity отдаётся клиенту как есть?

**Ответ:** Упрощение для ТЗ. Минус: всегда отдаём все поля, нельзя скрыть внутреннее. Плюс для ревью: «в проде сделал бы Response DTO или class-transformer `@Exclude()`».

---

### ESLint + Prettier — зачем?

**Ответ:** Единый стиль, ловит мелочи (unused vars). CI гоняет lint — ревьюер может проверить одной командой.

---

## 11. Swagger

### Зачем Swagger, если не в ТЗ?

**Ответ:** Быстрая демонстрация API лиду без Postman. Декораторы на DTO и `@ApiTags` на контроллере. Не обязателен в проде на публичном URL (часто отключают или за auth).

---

## 12. «Каверзные» вопросы и честные слабые места

### N+1 problem есть в проекте?

**Ответ:** Нет связей OneToMany/ManyToOne — одна таблица `tasks`, один запрос на метод. Если бы были relations с `relations: ['user']` в цикле — был бы N+1. Сейчас не актуально.

---

### Race condition при одновременном PATCH одной задачи?

**Ответ:** Last write wins — стандартно для простого CRUD без optimistic locking. В проде — `@VersionColumn()` или проверка `updatedAt` при update.

---

### Почему `findOne` в update/delete — два запроса?

**Ответ:** Сначала проверка существования + 404, потом save/remove. Можно `delete({ id })` и смотреть `affected` — один round-trip, но другой стиль ошибок.

---

### Логи в middleware — async, блокируют?

**Ответ:** `console.log` на `finish` — синхронный, для нагрузки плохо. В проде — async logger, correlation id (request id).

---

### Почему нет `ConfigModule`?

**Ответ:** Для маленького проекта env читается напрямую в `database.config.ts` и `main.ts`. В проде — `@nestjs/config` + схема валидации env при старте.

---

### Как бы масштабировал горизонтально?

**Ответ:** Stateless API (нет сессии в памяти) — можно несколько инстансов за load balancer. SQLite **не** подходит для нескольких инстансов (файл один). Нужен PostgreSQL/общая БД. Sticky sessions не нужны при stateless JWT.

---

### Observability: метрики, трейсы?

**Ответ:** Не реализовано. В проде — Prometheus metrics (`/metrics`), OpenTelemetry, health check `/health`.

---

## 13. Вопросы «по коду» — могут попросить открыть файл

| Файл | Могут спросить |
|------|----------------|
| `main.ts` | Настройка pipe, Swagger, порт |
| `app.module.ts` | Подключение БД и middleware |
| `database.config.ts` | Выбор sqlite/postgres, synchronize |
| `tasks.controller.ts` | Порядок `@Get()` и `@Get(':id')`, 204 на DELETE |
| `tasks.service.ts` | Пагинация, merge, NotFoundException |
| `create-task.dto.ts` | Trim, enum status |
| `task.entity.ts` | Декораторы колонок, timestamps |
| `request-logger.middleware.ts` | Почему `finish`, а не сразу log |
| `tasks.service.spec.ts` | Как мокается репозиторий |
| `tasks.e2e-spec.ts` | Зачем свой ValidationPipe в тесте |

---

## 14. Короткие ответы-one-liner (если торопят)

| Вопрос | One-liner |
|--------|-----------|
| Главный паттерн? | Layered: Controller → Service → Repository |
| Где валидация? | DTO + global ValidationPipe |
| Где 404? | `NotFoundException` в `findOne` |
| Где логи? | Middleware на все routes |
| Пагинация? | offset, 10, `createdAt DESC` |
| Тесты? | 2 unit + 3 e2e |
| БД локально? | sql.js → `tasks.sqlite` |
| БД в Docker? | PostgreSQL, `DB_TYPE=postgres` |
| Документация API? | Swagger `/api` |
| CI? | lint, test, build |

---

## 15. Что сказать в конце, если спросят «есть вопросы к нам?»

Примеры умных вопросов лиду (не обязательно все):

1. Какой у вас стек на бэкенде — Nest в проде или микс?
2. Как устроен code review — на что смотрите в первую очередь?
3. Есть ли общие гайды по миграциям, логированию, ошибкам API?
4. Какая команда — один сервис на человека или shared ownership?

---

*Файлы для подготовки: [PROJECT_GUIDE.md](./PROJECT_GUIDE.md) (архитектура), [README.md](./README.md) (запуск), код с комментариями в `src/`.*
