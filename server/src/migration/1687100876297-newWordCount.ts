import {MigrationInterface, QueryRunner} from "typeorm";

export class newWordCount1687100876297 implements MigrationInterface {
    name = 'newWordCount1687100876297'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP INDEX `IDX_8e0bb2d261fc46c8fd01333371` ON `user`");
        await queryRunner.query("ALTER TABLE `question` ADD `minWordCount` bigint UNSIGNED NULL");
        await queryRunner.query("ALTER TABLE `question` ADD `maxWordCount` bigint UNSIGNED NULL");
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
        await queryRunner.query("ALTER TABLE `question` DROP COLUMN `maxWordCount`");
        await queryRunner.query("ALTER TABLE `question` DROP COLUMN `minWordCount`");
        await queryRunner.query("CREATE UNIQUE INDEX `IDX_8e0bb2d261fc46c8fd01333371` ON `user` (`preferencesId`)");
    }

}
