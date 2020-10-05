import {MigrationInterface, QueryRunner} from "typeorm";

export class assignmentVersionFieldsForeignKeys1601915936238 implements MigrationInterface {
    name = 'assignmentVersionFieldsForeignKeys1601915936238'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment_version` ADD CONSTRAINT `FK_f3ca79c67d3d69dfb3484d75a10` FOREIGN KEY (`assignmentId`) REFERENCES `assignment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment_version` ADD CONSTRAINT `FK_eac9d9aa008914fae660ece9a6b` FOREIGN KEY (`submissionQuestionnaireId`) REFERENCES `questionnaire`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment_version` ADD CONSTRAINT `FK_1211a86b6a2ef31f472e0fc17f4` FOREIGN KEY (`reviewQuestionnaireId`) REFERENCES `questionnaire`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission` ADD CONSTRAINT `FK_27e114a5e0dc4f03eeea25aade1` FOREIGN KEY (`assignmentVersionId`) REFERENCES `assignment_version`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment_version_versions_to_review_assignment_version` ADD CONSTRAINT `FK_cd9bf4f10cfc0bf5fc3f3184cd1` FOREIGN KEY (`assignmentVersionId_1`) REFERENCES `assignment_version`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment_version_versions_to_review_assignment_version` ADD CONSTRAINT `FK_f0c4c7b79e63eb29b75fc0e9c87` FOREIGN KEY (`assignmentVersionId_2`) REFERENCES `assignment_version`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `assignment_version_versions_to_review_assignment_version` DROP FOREIGN KEY `FK_f0c4c7b79e63eb29b75fc0e9c87`");
        await queryRunner.query("ALTER TABLE `assignment_version_versions_to_review_assignment_version` DROP FOREIGN KEY `FK_cd9bf4f10cfc0bf5fc3f3184cd1`");
        await queryRunner.query("ALTER TABLE `submission` DROP FOREIGN KEY `FK_27e114a5e0dc4f03eeea25aade1`");
        await queryRunner.query("ALTER TABLE `assignment_version` DROP FOREIGN KEY `FK_1211a86b6a2ef31f472e0fc17f4`");
        await queryRunner.query("ALTER TABLE `assignment_version` DROP FOREIGN KEY `FK_eac9d9aa008914fae660ece9a6b`");
        await queryRunner.query("ALTER TABLE `assignment_version` DROP FOREIGN KEY `FK_f3ca79c67d3d69dfb3484d75a10`");
    }

}
