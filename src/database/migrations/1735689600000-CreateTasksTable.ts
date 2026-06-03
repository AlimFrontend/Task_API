import { MigrationInterface, QueryRunner, Table } from 'typeorm';

/**
 * Начальная миграция: таблица tasks (соответствует Task entity).
 * Если таблица уже есть (старый synchronize) — пропускаем создание.
 */
export class CreateTasksTable1735689600000 implements MigrationInterface {
  name = 'CreateTasksTable1735689600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('tasks');
    if (hasTable) {
      return;
    }

    const isPostgres = queryRunner.connection.options.type === 'postgres';
    const timestampType = isPostgres ? 'timestamp' : 'datetime';

    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'title',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'TODO'",
          },
          {
            name: 'createdAt',
            type: timestampType,
            default: isPostgres ? 'now()' : 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: timestampType,
            default: isPostgres ? 'now()' : 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tasks', true);
  }
}
