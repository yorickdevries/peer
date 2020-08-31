import {MigrationInterface, QueryRunner} from "typeorm";

export class assignmentState1598897656780 implements MigrationInterface {
    name = 'assignmentState1598897656780'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` ADD `state` varchar(255) NOT NULL");
        await queryRunner.query("UPDATE `assignment` SET `state` = 'unpublished'");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `state`");
    }

}
