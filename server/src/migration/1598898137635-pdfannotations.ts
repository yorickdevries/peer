import {MigrationInterface, QueryRunner} from "typeorm";

export class pdfannotations1598898137635 implements MigrationInterface {
    name = 'pdfannotations1598898137635'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `pdf_annotation` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` varchar(63) NOT NULL, `motivation` varchar(255) NOT NULL, `bodyValue` text NOT NULL, `selector` longtext NULL, `userNetid` varchar(63) NOT NULL, `fileId` int NOT NULL, `reviewId` int NOT NULL, `commentingPDFAnnotationId` varchar(63) NULL, INDEX `IDX_dbf2f807c4e4d22e5d96a0c1f2` (`motivation`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `pdf_annotation` ADD CONSTRAINT `FK_f4ea3da953083644fcecb14ea99` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `pdf_annotation` ADD CONSTRAINT `FK_9117b22b8ad9d64c1fb93d545f2` FOREIGN KEY (`fileId`) REFERENCES `file`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `pdf_annotation` ADD CONSTRAINT `FK_6c10f5804d690cd043585ab5bee` FOREIGN KEY (`reviewId`) REFERENCES `review`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `pdf_annotation` ADD CONSTRAINT `FK_230fca0f89449280703ae2e157d` FOREIGN KEY (`commentingPDFAnnotationId`) REFERENCES `pdf_annotation`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `pdf_annotation` DROP FOREIGN KEY `FK_230fca0f89449280703ae2e157d`");
        await queryRunner.query("ALTER TABLE `pdf_annotation` DROP FOREIGN KEY `FK_6c10f5804d690cd043585ab5bee`");
        await queryRunner.query("ALTER TABLE `pdf_annotation` DROP FOREIGN KEY `FK_9117b22b8ad9d64c1fb93d545f2`");
        await queryRunner.query("ALTER TABLE `pdf_annotation` DROP FOREIGN KEY `FK_f4ea3da953083644fcecb14ea99`");
        await queryRunner.query("DROP INDEX `IDX_dbf2f807c4e4d22e5d96a0c1f2` ON `pdf_annotation`");
        await queryRunner.query("DROP TABLE `pdf_annotation`");
    }

}
