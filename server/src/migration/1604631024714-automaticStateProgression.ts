import {MigrationInterface, QueryRunner} from "typeorm";

export class automaticStateProgression1604631024714 implements MigrationInterface {
    name = 'automaticStateProgression1604631024714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` ADD `automaticStateProgression` tinyint NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `automaticStateProgression`");
    }

}
