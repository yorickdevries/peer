import {MigrationInterface, QueryRunner} from "typeorm";

export class assignmentVersionFields1601915936237 implements MigrationInterface {
    name = 'assignmentVersionFields1601915936237'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `assignment_version` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `reviewsPerUserPerAssignmentVersionToReview` int NOT NULL, `selfReview` tinyint NOT NULL, `assignmentId` int NOT NULL, `submissionQuestionnaireId` int NULL, `reviewQuestionnaireId` int NULL, UNIQUE INDEX `REL_eac9d9aa008914fae660ece9a6` (`submissionQuestionnaireId`), UNIQUE INDEX `REL_1211a86b6a2ef31f472e0fc17f` (`reviewQuestionnaireId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `assignment_version_versions_to_review_assignment_version` (`assignmentVersionId_1` int NOT NULL, `assignmentVersionId_2` int NOT NULL, INDEX `IDX_cd9bf4f10cfc0bf5fc3f3184cd` (`assignmentVersionId_1`), INDEX `IDX_f0c4c7b79e63eb29b75fc0e9c8` (`assignmentVersionId_2`), PRIMARY KEY (`assignmentVersionId_1`, `assignmentVersionId_2`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `submission` ADD `assignmentVersionId` int NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `submission` DROP COLUMN `assignmentVersionId`");
        await queryRunner.query("DROP INDEX `IDX_f0c4c7b79e63eb29b75fc0e9c8` ON `assignment_version_versions_to_review_assignment_version`");
        await queryRunner.query("DROP INDEX `IDX_cd9bf4f10cfc0bf5fc3f3184cd` ON `assignment_version_versions_to_review_assignment_version`");
        await queryRunner.query("DROP TABLE `assignment_version_versions_to_review_assignment_version`");
        await queryRunner.query("DROP INDEX `REL_1211a86b6a2ef31f472e0fc17f` ON `assignment_version`");
        await queryRunner.query("DROP INDEX `REL_eac9d9aa008914fae660ece9a6` ON `assignment_version`");
        await queryRunner.query("DROP TABLE `assignment_version`");
    }

}
