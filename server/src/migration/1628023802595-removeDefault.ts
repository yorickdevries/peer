import {MigrationInterface, QueryRunner} from "typeorm";

export class removeDefault1628023802595 implements MigrationInterface {
    name = 'removeDefault1628023802595'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` CHANGE `flaggedByServer` `flaggedByServer` tinyint NULL");
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `assignmentType` `assignmentType` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment` CHANGE `assignmentType` `assignmentType` varchar(255) CHARACTER SET \"utf8mb4\" COLLATE \"utf8mb4_general_ci\" NOT NULL DEFAULT 'document'");
        await queryRunner.query("ALTER TABLE `submission` CHANGE `flaggedByServer` `flaggedByServer` tinyint NULL DEFAULT '0'");
    }

}
