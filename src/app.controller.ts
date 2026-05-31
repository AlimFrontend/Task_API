import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root(): { message: string; endpoints: string[] } {
    return {
      message: 'NestJS Task API',
      endpoints: [
        'GET /tasks',
        'GET /tasks/:id',
        'POST /tasks',
        'PATCH /tasks/:id',
        'DELETE /tasks/:id',
        'GET /api (Swagger)',
      ],
    };
  }
}
