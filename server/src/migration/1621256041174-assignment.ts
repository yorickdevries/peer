import {MigrationInterface, QueryRunner} from "typeorm";

export class assignment1621256041174 implements MigrationInterface {
    name = 'assignment1621256041174'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `publishDate` `publishDate` timestamp NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `dueDate` `dueDate` timestamp NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `reviewPublishDate` `reviewPublishDate` timestamp NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `reviewDueDate` `reviewDueDate` timestamp NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` ADD `assignmentType` varchar(255) NOT NULL DEFAULT 'document'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `assignmentType` `assignmentType` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `reviewDueDate` `reviewDueDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `reviewPublishDate` `reviewPublishDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `dueDate` `dueDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `publishDate` `publishDate` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'");
    }

}
