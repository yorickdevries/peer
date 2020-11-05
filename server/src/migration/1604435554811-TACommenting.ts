import {MigrationInterface, QueryRunner} from "typeorm";

export class TACommenting1604435554811 implements MigrationInterface {
    name = 'TACommenting1604435554811'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `review` ADD `commentByTA` text NULL");
        await queryRunner.query("ALTER TABLE `submission` ADD `commentByTA` text NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` DROP COLUMN `commentByTA`");
        await queryRunner.query("ALTER TABLE `review` DROP COLUMN `commentByTA`");
    }

}
