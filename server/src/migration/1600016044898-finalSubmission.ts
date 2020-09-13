import {MigrationInterface, QueryRunner} from "typeorm";

export class finalSubmission1600016044898 implements MigrationInterface {
    name = 'finalSubmission1600016044898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` ADD `final` tinyint NOT NULL");
        await queryRunner.query("UPDATE `submission` SET `final` = false");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` DROP COLUMN `final`");
    }

}
