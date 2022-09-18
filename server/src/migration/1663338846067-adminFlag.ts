import {MigrationInterface, QueryRunner} from "typeorm";

export class adminFlag1663338846067 implements MigrationInterface {
    name = 'adminFlag1663338846067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` ADD `admin` tinyint NOT NULL DEFAULT 0");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `admin`");
    }

}
