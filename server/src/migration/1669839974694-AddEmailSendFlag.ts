import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEmailSendFlag1669839974694 implements MigrationInterface {
    name = 'AddEmailSendFlag1669839974694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` ADD `sendNotificationEmails` tinyint NOT NULL DEFAULT 1");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `sendNotificationEmails`");
    }

}
