import { Injectable, NestMiddleware } from '@nestjs/common';

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

    next();
  }
}
