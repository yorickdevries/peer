import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveOldComments1604436949314 implements MigrationInterface {
    name = 'RemoveOldComments1604436949314'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `review_comment` DROP FOREIGN KEY `FK_3c9d31f6121408a92687a262053`");
        await queryRunner.query("ALTER TABLE `review_comment` DROP FOREIGN KEY `FK_786bee649c7d8a04e0e028d1484`");
        await queryRunner.query("ALTER TABLE `submission_comment` DROP FOREIGN KEY `FK_085f08fcc3ca2a4213abd937e51`");
        await queryRunner.query("ALTER TABLE `submission_comment` DROP FOREIGN KEY `FK_0529cef36979aa10d3f348849e1`");
        await queryRunner.query("DROP TABLE `review_comment`");
        await queryRunner.query("DROP TABLE `submission_comment`");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `submission_comment` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `text` text NOT NULL, `userNetid` varchar(63) NOT NULL, `submissionId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `review_comment` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `text` text NOT NULL, `userNetid` varchar(63) NOT NULL, `reviewId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `submission_comment` ADD CONSTRAINT `FK_0529cef36979aa10d3f348849e1` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission_comment` ADD CONSTRAINT `FK_085f08fcc3ca2a4213abd937e51` FOREIGN KEY (`submissionId`) REFERENCES `submission`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review_comment` ADD CONSTRAINT `FK_786bee649c7d8a04e0e028d1484` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review_comment` ADD CONSTRAINT `FK_3c9d31f6121408a92687a262053` FOREIGN KEY (`reviewId`) REFERENCES `review`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

}
