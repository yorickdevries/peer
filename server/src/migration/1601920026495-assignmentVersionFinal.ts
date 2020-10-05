import {MigrationInterface, QueryRunner} from "typeorm";

export class assignmentVersionFinal1601920026495 implements MigrationInterface {
    name = 'assignmentVersionFinal1601920026495'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` DROP FOREIGN KEY `FK_ef99745f278ca701c5efe5d8ddd`");
        await queryRunner.query("ALTER TABLE `assignment` DROP FOREIGN KEY `FK_01758965931ae6238fc2520539d`");
        await queryRunner.query("ALTER TABLE `assignment` DROP FOREIGN KEY `FK_df7f8ea69df0b2cd620801b526f`");
        await queryRunner.query("DROP INDEX `REL_df7f8ea69df0b2cd620801b526` ON `assignment`");
        await queryRunner.query("DROP INDEX `REL_01758965931ae6238fc2520539` ON `assignment`");
        await queryRunner.query("ALTER TABLE `submission` DROP COLUMN `assignmentId`");
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `reviewsPerUser`");
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `submissionQuestionnaireId`");
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `reviewQuestionnaireId`");
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
        await queryRunner.query("ALTER TABLE `assignment` ADD `reviewQuestionnaireId` int NULL");
        await queryRunner.query("ALTER TABLE `assignment` ADD `submissionQuestionnaireId` int NULL");
        await queryRunner.query("ALTER TABLE `assignment` ADD `reviewsPerUser` int NOT NULL");
        await queryRunner.query("ALTER TABLE `submission` ADD `assignmentId` int NOT NULL");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_01758965931ae6238fc2520539` ON `assignment` (`reviewQuestionnaireId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_df7f8ea69df0b2cd620801b526` ON `assignment` (`submissionQuestionnaireId`)");
        await queryRunner.query("ALTER TABLE `assignment` ADD CONSTRAINT `FK_df7f8ea69df0b2cd620801b526f` FOREIGN KEY (`submissionQuestionnaireId`) REFERENCES `questionnaire`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment` ADD CONSTRAINT `FK_01758965931ae6238fc2520539d` FOREIGN KEY (`reviewQuestionnaireId`) REFERENCES `questionnaire`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission` ADD CONSTRAINT `FK_ef99745f278ca701c5efe5d8ddd` FOREIGN KEY (`assignmentId`) REFERENCES `assignment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
