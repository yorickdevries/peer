import {MigrationInterface, QueryRunner} from "typeorm";

export class questionOptions1619100324441 implements MigrationInterface {
    name = 'questionOptions1619100324441'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `question` ADD `graded` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `question_option` ADD `points` int NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `question_option` DROP COLUMN `points`");
        await queryRunner.query("ALTER TABLE `question` DROP COLUMN `graded`");
    }

}
