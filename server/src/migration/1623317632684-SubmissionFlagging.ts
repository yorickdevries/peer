import {MigrationInterface, QueryRunner} from "typeorm";

export class SubmissionFlagging1623317632684 implements MigrationInterface {
    name = 'SubmissionFlagging1623317632684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` ADD `flaggedByServer` tinyint 0");
        await queryRunner.query("ALTER TABLE `submission` ADD `commentByServer` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` DROP COLUMN `commentByServer`");
        await queryRunner.query("ALTER TABLE `submission` DROP COLUMN `flaggedByServer`");
    }

}
