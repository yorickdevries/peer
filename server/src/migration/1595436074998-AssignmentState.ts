import {MigrationInterface, QueryRunner} from "typeorm";

export class AssignmentState1595436074998 implements MigrationInterface {
    name = 'AssignmentState1595436074998'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` ADD `state` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` DROP COLUMN `state`");
    }

}
