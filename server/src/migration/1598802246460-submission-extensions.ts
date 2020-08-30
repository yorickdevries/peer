import {MigrationInterface, QueryRunner} from "typeorm";

export class submissionExtensions1598802246460 implements MigrationInterface {
    name = 'submissionExtensions1598802246460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` ADD `submissionExtensions` varchar(255) NOT NULL");
        await queryRunner.query("UPDATE `assignment` SET `submissionExtensions` = '.pdf,.zip,.doc,.docx'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `submissionExtensions`");
    }

}
