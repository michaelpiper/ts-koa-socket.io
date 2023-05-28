import { type MigrationInterface, type QueryRunner } from 'typeorm'
export class Migration1684885942629 implements MigrationInterface {
  name: string = 'Migration1684885942629'
  async up (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "temporary_todolist" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(125), "task" text, "isCompleted" boolean NOT NULL DEFAULT (0), "createdAt" date NOT NULL DEFAULT (1684885945885), "updatedAt" date NOT NULL DEFAULT (1684885945885))')
    await queryRunner.query('INSERT INTO "temporary_todolist"("id", "name", "task", "isCompleted", "createdAt", "updatedAt") SELECT "id", "name", "task", "isCompleted", "createdAt", "updatedAt" FROM "todolist"')
    await queryRunner.query('DROP TABLE "todolist"')
    await queryRunner.query('ALTER TABLE "temporary_todolist" RENAME TO "todolist"')
  }

  async down (queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "todolist" RENAME TO "temporary_todolist"')
    await queryRunner.query('CREATE TABLE "todolist" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar(125), "task" text, "isCompleted" boolean NOT NULL DEFAULT (0), "createdAt" date NOT NULL DEFAULT (1684885898011), "updatedAt" date NOT NULL DEFAULT (1684885898011))')
    await queryRunner.query('INSERT INTO "todolist"("id", "name", "task", "isCompleted", "createdAt", "updatedAt") SELECT "id", "name", "task", "isCompleted", "createdAt", "updatedAt" FROM "temporary_todolist"')
    await queryRunner.query('DROP TABLE "temporary_todolist"')
  }
}
// # sourceMappingURL=1684885942629-migration.js.map
