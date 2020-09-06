import {MigrationInterface, QueryRunner} from "typeorm";

export class assignmentExports1599430659048 implements MigrationInterface {
    name = 'assignmentExports1599430659048'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `assignment_export` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `userNetid` varchar(63) NOT NULL, `assignmentId` int NOT NULL, `fileId` int NULL, UNIQUE INDEX `REL_2d34fa5f0ed78a53e698958600` (`fileId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `assignment_export` ADD CONSTRAINT `FK_1cc42043e0cb067df4c13b29d7f` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment_export` ADD CONSTRAINT `FK_c4586a3fa2ef5c79b583a911965` FOREIGN KEY (`assignmentId`) REFERENCES `assignment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment_export` ADD CONSTRAINT `FK_2d34fa5f0ed78a53e6989586009` FOREIGN KEY (`fileId`) REFERENCES `file`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment_export` DROP FOREIGN KEY `FK_2d34fa5f0ed78a53e6989586009`");
        await queryRunner.query("ALTER TABLE `assignment_export` DROP FOREIGN KEY `FK_c4586a3fa2ef5c79b583a911965`");
        await queryRunner.query("ALTER TABLE `assignment_export` DROP FOREIGN KEY `FK_1cc42043e0cb067df4c13b29d7f`");
        await queryRunner.query("DROP INDEX `REL_2d34fa5f0ed78a53e698958600` ON `assignment_export`");
        await queryRunner.query("DROP TABLE `assignment_export`");
    }

}
