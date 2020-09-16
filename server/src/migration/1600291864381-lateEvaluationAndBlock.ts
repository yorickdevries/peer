import {MigrationInterface, QueryRunner} from "typeorm";

export class lateEvaluationAndBlock1600291864381 implements MigrationInterface {
    name = 'lateEvaluationAndBlock1600291864381'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` ADD `blockFeedback` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` ADD `lateReviewEvaluations` tinyint NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `lateReviewEvaluations`");
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `blockFeedback`");
    }

}
