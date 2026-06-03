/**
 * Допустимые статусы задачи — по ТЗ: TODO | IN_PROGRESS | DONE.
 * Строковый enum: значения совпадают с тем, что хранится в БД и приходит в JSON.
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}
