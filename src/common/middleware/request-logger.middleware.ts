/**
 * Middleware логирования HTTP-запросов — требование ТЗ.
 *
 * Работает до контроллера: вызывает next(), а лог пишет на событие finish ответа,
 * чтобы в лог попал финальный statusCode (200, 404, 400 и т.д.).
 */
import { Injectable, NestMiddleware } from '@nestjs/common';

// Минимальные типы вместо express.Request — достаточно для логирования
type RequestLike = {
  method: string;
  originalUrl: string;
};

type ResponseLike = {
  statusCode: number;
  on(event: 'finish', listener: () => void): void;
};

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(request: RequestLike, response: ResponseLike, next: () => void): void {
    const startedAt = Date.now();

    response.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      console.log(
        `${request.method} ${request.originalUrl} ${response.statusCode} - ${durationMs}ms`,
      );
    });

    next(); // Передаём управление следующему обработчику (ValidationPipe → Controller)
  }
}
