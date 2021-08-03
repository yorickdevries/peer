import { MigrationInterface, QueryRunner } from "typeorm";

export class assignment1621256041174 implements MigrationInterface {
  name = "assignment1621256041174";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Notice how it says 'ADD' instead of 'CHANGE'. This makes sure the column assignmentType gets initialized with "document"
    await queryRunner.query(
      "ALTER TABLE `assignment` ADD `assignmentType` varchar(255) NOT NULL DEFAULT 'document'"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `assignment` DROP `assignmentType` `assignmentType` varchar(255) NOT NULL"
    );
  }
}
