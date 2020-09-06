import {MigrationInterface, QueryRunner} from "typeorm";

export class lateSubmissionsAndReviews1599349472033 implements MigrationInterface {
    name = 'lateSubmissionsAndReviews1599349472033'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` ADD `lateSubmissions` tinyint NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` ADD `lateSubmissionReviews` tinyint NOT NULL");
        await queryRunner.query("UPDATE `assignment` SET `lateSubmissions` = false");
        await queryRunner.query("UPDATE `assignment` SET `lateSubmissionReviews` = false");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `lateSubmissionReviews`");
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `lateSubmissions`");
    }

}
