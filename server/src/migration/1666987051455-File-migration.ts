import {MigrationInterface, QueryRunner} from "typeorm";

export class FileMigration1666987051455 implements MigrationInterface {
    name = 'FileMigration1666987051455'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `file` ADD `filePath` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `file` DROP COLUMN `filePath`");
    }

}
