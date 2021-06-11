import { MigrationInterface, QueryRunner } from "typeorm";

export class SubmissionFlagging1623317632684 implements MigrationInterface {
  name = "SubmissionFlagging1623317632684";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `submission` ADD `flaggedByServer` tinyint NULL DEFAULT 0" // Setting it to FALSE prevents the server from starting jobs for every old submission
    );
    await queryRunner.query(
      "ALTER TABLE `submission` ADD `commentByServer` text NULL"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `submission` DROP COLUMN `commentByServer`"
    );
    await queryRunner.query(
      "ALTER TABLE `submission` DROP COLUMN `flaggedByServer`"
    );
  }
}
