import {MigrationInterface, QueryRunner} from "typeorm";

export class submissionExtensions1598802246460 implements MigrationInterface {
    name = 'submissionExtensions1598802246460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` ADD `submissionExtensions` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `publishDate` `publishDate` timestamp NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `dueDate` `dueDate` timestamp NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `reviewPublishDate` `reviewPublishDate` timestamp NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `reviewDueDate` `reviewDueDate` timestamp NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `reviewDueDate` `reviewDueDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `reviewPublishDate` `reviewPublishDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `dueDate` `dueDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `publishDate` `publishDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'");
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `submissionExtensions`");
    }

}
