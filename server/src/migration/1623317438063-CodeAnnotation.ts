import { MigrationInterface, QueryRunner } from "typeorm";

export class CodeAnnotation1623317438063 implements MigrationInterface {
  name = "CodeAnnotation1623317438063";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TABLE `code_annotation` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `annotationText` text NOT NULL, `startLineNumber` int NOT NULL, `endLineNumber` int NOT NULL, `selectedFile` varchar(255) NOT NULL, `reviewId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB"
    );
    await queryRunner.query(
      "ALTER TABLE `code_annotation` ADD CONSTRAINT `FK_2f9c2ef1c8cb3b4802b339846ad` FOREIGN KEY (`reviewId`) REFERENCES `review`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "ALTER TABLE `code_annotation` DROP FOREIGN KEY `FK_2f9c2ef1c8cb3b4802b339846ad`"
    );
    await queryRunner.query("DROP TABLE `code_annotation`");
  }
}
