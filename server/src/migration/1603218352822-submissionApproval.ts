import {MigrationInterface, QueryRunner} from "typeorm";

export class submissionApproval1603218352822 implements MigrationInterface {
    name = 'submissionApproval1603218352822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` ADD `approvalByTA` tinyint NULL");
        await queryRunner.query("ALTER TABLE `submission` ADD `approvingTANetid` varchar(63) NULL");
        await queryRunner.query("ALTER TABLE `submission` ADD CONSTRAINT `FK_37867850707f9d6ee32c1807d75` FOREIGN KEY (`approvingTANetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` DROP FOREIGN KEY `FK_37867850707f9d6ee32c1807d75`");
        await queryRunner.query("ALTER TABLE `submission` DROP COLUMN `approvingTANetid`");
        await queryRunner.query("ALTER TABLE `submission` DROP COLUMN `approvalByTA`");
    }

}
