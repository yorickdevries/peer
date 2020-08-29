import {MigrationInterface, QueryRunner} from "typeorm";

export class initial1598377913080 implements MigrationInterface {
    name = 'initial1598377913080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `affiliation` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `study` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `organisation_unit` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `netid` varchar(63) NOT NULL, `studentNumber` int NULL, `firstName` varchar(255) NULL, `prefix` varchar(255) NULL, `lastName` varchar(255) NULL, `email` varchar(255) NULL, `displayName` varchar(255) NULL, PRIMARY KEY (`netid`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `faculty` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `longName` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `academic_year` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `active` tinyint NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `enrollment` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `userNetid` varchar(63) NOT NULL, `courseId` int NOT NULL, `role` varchar(255) NOT NULL, PRIMARY KEY (`userNetid`, `courseId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `group` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `courseId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `file` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `extension` varchar(255) NOT NULL, `hash` varchar(255) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `question` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `type` varchar(255) NOT NULL, `text` text NOT NULL, `number` int NOT NULL, `optional` tinyint NOT NULL, `range` int NULL, `extensions` varchar(255) NULL, `questionnaireId` int NOT NULL, INDEX `IDX_91578dceeb42466b9285f29e4b` (`type`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `question_answer` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `type` varchar(255) NOT NULL, `questionId` int NOT NULL, `reviewId` int NOT NULL, `openAnswer` text NULL, `rangeAnswer` int NULL, `multipleChoiceAnswerId` int NULL, `uploadAnswerId` int NULL, UNIQUE INDEX `REL_94dea89fc7de3d4c33812ac013` (`uploadAnswerId`), INDEX `IDX_24904f31379ef7d24ef3f1ab17` (`type`), PRIMARY KEY (`questionId`, `reviewId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `review` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `type` varchar(255) NOT NULL, `flaggedByReviewer` tinyint NOT NULL, `submitted` tinyint NOT NULL, `startedAt` timestamp NULL, `downloadedAt` timestamp NULL, `submittedAt` timestamp NULL, `approvalByTA` tinyint NULL, `questionnaireId` int NOT NULL, `reviewerNetid` varchar(63) NOT NULL, `approvingTANetid` varchar(63) NULL, `reviewOfSubmissionId` int NULL, `submissionId` int NULL, INDEX `IDX_8edcfd5ea728371ad7debd6996` (`type`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `questionnaire` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `type` varchar(255) NOT NULL, INDEX `IDX_370a04e24b73e4f2473b397729` (`type`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `submission` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `userNetid` varchar(63) NOT NULL, `groupId` int NOT NULL, `assignmentId` int NOT NULL, `fileId` int NULL, UNIQUE INDEX `REL_dec51148a6379ffdc1ea98fdb8` (`fileId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `assignment` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `reviewsPerUser` int NOT NULL, `enrollable` tinyint NOT NULL, `reviewEvaluation` tinyint NOT NULL, `publishDate` timestamp NOT NULL, `dueDate` timestamp NOT NULL, `reviewPublishDate` timestamp NOT NULL, `reviewDueDate` timestamp NOT NULL, `reviewEvaluationDueDate` timestamp NULL, `description` text NULL, `externalLink` varchar(255) NULL, `fileId` int NULL, `submissionQuestionnaireId` int NULL, `reviewQuestionnaireId` int NULL, `courseId` int NOT NULL, UNIQUE INDEX `REL_8daf64977e5c3fd1df594b7abe` (`fileId`), UNIQUE INDEX `REL_df7f8ea69df0b2cd620801b526` (`submissionQuestionnaireId`), UNIQUE INDEX `REL_01758965931ae6238fc2520539` (`reviewQuestionnaireId`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `course` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `name` varchar(255) NOT NULL, `courseCode` varchar(255) NOT NULL, `enrollable` tinyint NOT NULL, `description` text NULL, `facultyId` int NOT NULL, `academicYearId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `question_option` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `type` varchar(255) NOT NULL, `text` text NOT NULL, `questionId` int NOT NULL, INDEX `IDX_61b91a5725a871eebd0897769e` (`type`), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `submission_comment` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `text` text NOT NULL, `userNetid` varchar(63) NOT NULL, `submissionId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `review_comment` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `text` text NOT NULL, `userNetid` varchar(63) NOT NULL, `reviewId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_affiliation_affiliation` (`userNetid` varchar(63) NOT NULL, `affiliationId` int NOT NULL, INDEX `IDX_c16e312cfa5a5519f335c4b637` (`userNetid`), INDEX `IDX_7cdc0d3f4cb516f0e15d621b9f` (`affiliationId`), PRIMARY KEY (`userNetid`, `affiliationId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_study_study` (`userNetid` varchar(63) NOT NULL, `studyId` int NOT NULL, INDEX `IDX_7b982e7b1038174bc289e8e4c1` (`userNetid`), INDEX `IDX_9a0c50a833104bac44d4a15e37` (`studyId`), PRIMARY KEY (`userNetid`, `studyId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_organisation_unit_organisation_unit` (`userNetid` varchar(63) NOT NULL, `organisationUnitId` int NOT NULL, INDEX `IDX_7c86819087c1b50c998f76d96c` (`userNetid`), INDEX `IDX_7c52eb55423199bdfcaafc6d74` (`organisationUnitId`), PRIMARY KEY (`userNetid`, `organisationUnitId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `group_users_user` (`groupId` int NOT NULL, `userNetid` varchar(63) NOT NULL, INDEX `IDX_fe6cce7d479552c17823e267af` (`groupId`), INDEX `IDX_c180b6dbe5df75d65af330f95b` (`userNetid`), PRIMARY KEY (`groupId`, `userNetid`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `group_assignments_assignment` (`groupId` int NOT NULL, `assignmentId` int NOT NULL, INDEX `IDX_af9d37221f979bfd646d84ebc6` (`groupId`), INDEX `IDX_2a6f5b6f54ffea20e79d8092c4` (`assignmentId`), PRIMARY KEY (`groupId`, `assignmentId`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `question_answer_checkbox_answer_question_option` (`questionAnswerQuestionId` int NOT NULL, `questionAnswerReviewId` int NOT NULL, `questionOptionId` int NOT NULL, INDEX `IDX_cc1cb9589b3460bc242a8f06d5` (`questionAnswerQuestionId`, `questionAnswerReviewId`), INDEX `IDX_93b1985a5a1f291b695c9024a7` (`questionOptionId`), PRIMARY KEY (`questionAnswerQuestionId`, `questionAnswerReviewId`, `questionOptionId`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `enrollment` ADD CONSTRAINT `FK_95738965b9e38fff53b20c4046d` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `enrollment` ADD CONSTRAINT `FK_d1a599a7740b4f4bd1120850f04` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `group` ADD CONSTRAINT `FK_39caf5d075ae8a8d384fda66951` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `question` ADD CONSTRAINT `FK_3f7828c3b2c8db7b5e41cade66a` FOREIGN KEY (`questionnaireId`) REFERENCES `questionnaire`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `question_answer` ADD CONSTRAINT `FK_1adf9ebd234bfde6fb88f0da94e` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `question_answer` ADD CONSTRAINT `FK_c098736a2c04bed5f144a62e770` FOREIGN KEY (`reviewId`) REFERENCES `review`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `question_answer` ADD CONSTRAINT `FK_1ffdb0f25557e7a85404e6acb45` FOREIGN KEY (`multipleChoiceAnswerId`) REFERENCES `question_option`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `question_answer` ADD CONSTRAINT `FK_94dea89fc7de3d4c33812ac0130` FOREIGN KEY (`uploadAnswerId`) REFERENCES `file`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review` ADD CONSTRAINT `FK_3000febd4ce4111dd14ab24c968` FOREIGN KEY (`questionnaireId`) REFERENCES `questionnaire`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review` ADD CONSTRAINT `FK_1a66a143762e5403d34079eb4fc` FOREIGN KEY (`reviewerNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review` ADD CONSTRAINT `FK_681fb251dc7a4ba6db19150ce41` FOREIGN KEY (`approvingTANetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review` ADD CONSTRAINT `FK_361c73b1cb0c1ed0871f17ccae7` FOREIGN KEY (`reviewOfSubmissionId`) REFERENCES `review`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review` ADD CONSTRAINT `FK_573c93116ce7af977a6307cb83a` FOREIGN KEY (`submissionId`) REFERENCES `submission`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission` ADD CONSTRAINT `FK_483bcfe094b5890ea1ed8a2f0eb` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission` ADD CONSTRAINT `FK_9a7928e5935c4cd5f02edaaa139` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission` ADD CONSTRAINT `FK_ef99745f278ca701c5efe5d8ddd` FOREIGN KEY (`assignmentId`) REFERENCES `assignment`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission` ADD CONSTRAINT `FK_dec51148a6379ffdc1ea98fdb82` FOREIGN KEY (`fileId`) REFERENCES `file`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment` ADD CONSTRAINT `FK_8daf64977e5c3fd1df594b7abe0` FOREIGN KEY (`fileId`) REFERENCES `file`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment` ADD CONSTRAINT `FK_df7f8ea69df0b2cd620801b526f` FOREIGN KEY (`submissionQuestionnaireId`) REFERENCES `questionnaire`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment` ADD CONSTRAINT `FK_01758965931ae6238fc2520539d` FOREIGN KEY (`reviewQuestionnaireId`) REFERENCES `questionnaire`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `assignment` ADD CONSTRAINT `FK_5218258c0784c8b47c5079b8198` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `course` ADD CONSTRAINT `FK_8bd771a1318f38978d9d4f8d8a2` FOREIGN KEY (`facultyId`) REFERENCES `faculty`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `course` ADD CONSTRAINT `FK_91ccbfcb05511caea7b4415bbf2` FOREIGN KEY (`academicYearId`) REFERENCES `academic_year`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `question_option` ADD CONSTRAINT `FK_ba19747af180520381a117f5986` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission_comment` ADD CONSTRAINT `FK_0529cef36979aa10d3f348849e1` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `submission_comment` ADD CONSTRAINT `FK_085f08fcc3ca2a4213abd937e51` FOREIGN KEY (`submissionId`) REFERENCES `submission`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review_comment` ADD CONSTRAINT `FK_786bee649c7d8a04e0e028d1484` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `review_comment` ADD CONSTRAINT `FK_3c9d31f6121408a92687a262053` FOREIGN KEY (`reviewId`) REFERENCES `review`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_affiliation_affiliation` ADD CONSTRAINT `FK_c16e312cfa5a5519f335c4b6373` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_affiliation_affiliation` ADD CONSTRAINT `FK_7cdc0d3f4cb516f0e15d621b9fb` FOREIGN KEY (`affiliationId`) REFERENCES `affiliation`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_study_study` ADD CONSTRAINT `FK_7b982e7b1038174bc289e8e4c1a` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_study_study` ADD CONSTRAINT `FK_9a0c50a833104bac44d4a15e371` FOREIGN KEY (`studyId`) REFERENCES `study`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_organisation_unit_organisation_unit` ADD CONSTRAINT `FK_7c86819087c1b50c998f76d96c1` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_organisation_unit_organisation_unit` ADD CONSTRAINT `FK_7c52eb55423199bdfcaafc6d741` FOREIGN KEY (`organisationUnitId`) REFERENCES `organisation_unit`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `group_users_user` ADD CONSTRAINT `FK_fe6cce7d479552c17823e267aff` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `group_users_user` ADD CONSTRAINT `FK_c180b6dbe5df75d65af330f95b6` FOREIGN KEY (`userNetid`) REFERENCES `user`(`netid`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `group_assignments_assignment` ADD CONSTRAINT `FK_af9d37221f979bfd646d84ebc64` FOREIGN KEY (`groupId`) REFERENCES `group`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `group_assignments_assignment` ADD CONSTRAINT `FK_2a6f5b6f54ffea20e79d8092c47` FOREIGN KEY (`assignmentId`) REFERENCES `assignment`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `question_answer_checkbox_answer_question_option` ADD CONSTRAINT `FK_cc1cb9589b3460bc242a8f06d59` FOREIGN KEY (`questionAnswerQuestionId`, `questionAnswerReviewId`) REFERENCES `question_answer`(`questionId`,`reviewId`) ON DELETE CASCADE ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `question_answer_checkbox_answer_question_option` ADD CONSTRAINT `FK_93b1985a5a1f291b695c9024a74` FOREIGN KEY (`questionOptionId`) REFERENCES `question_option`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `question_answer_checkbox_answer_question_option` DROP FOREIGN KEY `FK_93b1985a5a1f291b695c9024a74`");
        await queryRunner.query("ALTER TABLE `question_answer_checkbox_answer_question_option` DROP FOREIGN KEY `FK_cc1cb9589b3460bc242a8f06d59`");
        await queryRunner.query("ALTER TABLE `group_assignments_assignment` DROP FOREIGN KEY `FK_2a6f5b6f54ffea20e79d8092c47`");
        await queryRunner.query("ALTER TABLE `group_assignments_assignment` DROP FOREIGN KEY `FK_af9d37221f979bfd646d84ebc64`");
        await queryRunner.query("ALTER TABLE `group_users_user` DROP FOREIGN KEY `FK_c180b6dbe5df75d65af330f95b6`");
        await queryRunner.query("ALTER TABLE `group_users_user` DROP FOREIGN KEY `FK_fe6cce7d479552c17823e267aff`");
        await queryRunner.query("ALTER TABLE `user_organisation_unit_organisation_unit` DROP FOREIGN KEY `FK_7c52eb55423199bdfcaafc6d741`");
        await queryRunner.query("ALTER TABLE `user_organisation_unit_organisation_unit` DROP FOREIGN KEY `FK_7c86819087c1b50c998f76d96c1`");
        await queryRunner.query("ALTER TABLE `user_study_study` DROP FOREIGN KEY `FK_9a0c50a833104bac44d4a15e371`");
        await queryRunner.query("ALTER TABLE `user_study_study` DROP FOREIGN KEY `FK_7b982e7b1038174bc289e8e4c1a`");
        await queryRunner.query("ALTER TABLE `user_affiliation_affiliation` DROP FOREIGN KEY `FK_7cdc0d3f4cb516f0e15d621b9fb`");
        await queryRunner.query("ALTER TABLE `user_affiliation_affiliation` DROP FOREIGN KEY `FK_c16e312cfa5a5519f335c4b6373`");
        await queryRunner.query("ALTER TABLE `review_comment` DROP FOREIGN KEY `FK_3c9d31f6121408a92687a262053`");
        await queryRunner.query("ALTER TABLE `review_comment` DROP FOREIGN KEY `FK_786bee649c7d8a04e0e028d1484`");
        await queryRunner.query("ALTER TABLE `submission_comment` DROP FOREIGN KEY `FK_085f08fcc3ca2a4213abd937e51`");
        await queryRunner.query("ALTER TABLE `submission_comment` DROP FOREIGN KEY `FK_0529cef36979aa10d3f348849e1`");
        await queryRunner.query("ALTER TABLE `question_option` DROP FOREIGN KEY `FK_ba19747af180520381a117f5986`");
        await queryRunner.query("ALTER TABLE `course` DROP FOREIGN KEY `FK_91ccbfcb05511caea7b4415bbf2`");
        await queryRunner.query("ALTER TABLE `course` DROP FOREIGN KEY `FK_8bd771a1318f38978d9d4f8d8a2`");
        await queryRunner.query("ALTER TABLE `assignment` DROP FOREIGN KEY `FK_5218258c0784c8b47c5079b8198`");
        await queryRunner.query("ALTER TABLE `assignment` DROP FOREIGN KEY `FK_01758965931ae6238fc2520539d`");
        await queryRunner.query("ALTER TABLE `assignment` DROP FOREIGN KEY `FK_df7f8ea69df0b2cd620801b526f`");
        await queryRunner.query("ALTER TABLE `assignment` DROP FOREIGN KEY `FK_8daf64977e5c3fd1df594b7abe0`");
        await queryRunner.query("ALTER TABLE `submission` DROP FOREIGN KEY `FK_dec51148a6379ffdc1ea98fdb82`");
        await queryRunner.query("ALTER TABLE `submission` DROP FOREIGN KEY `FK_ef99745f278ca701c5efe5d8ddd`");
        await queryRunner.query("ALTER TABLE `submission` DROP FOREIGN KEY `FK_9a7928e5935c4cd5f02edaaa139`");
        await queryRunner.query("ALTER TABLE `submission` DROP FOREIGN KEY `FK_483bcfe094b5890ea1ed8a2f0eb`");
        await queryRunner.query("ALTER TABLE `review` DROP FOREIGN KEY `FK_573c93116ce7af977a6307cb83a`");
        await queryRunner.query("ALTER TABLE `review` DROP FOREIGN KEY `FK_361c73b1cb0c1ed0871f17ccae7`");
        await queryRunner.query("ALTER TABLE `review` DROP FOREIGN KEY `FK_681fb251dc7a4ba6db19150ce41`");
        await queryRunner.query("ALTER TABLE `review` DROP FOREIGN KEY `FK_1a66a143762e5403d34079eb4fc`");
        await queryRunner.query("ALTER TABLE `review` DROP FOREIGN KEY `FK_3000febd4ce4111dd14ab24c968`");
        await queryRunner.query("ALTER TABLE `question_answer` DROP FOREIGN KEY `FK_94dea89fc7de3d4c33812ac0130`");
        await queryRunner.query("ALTER TABLE `question_answer` DROP FOREIGN KEY `FK_1ffdb0f25557e7a85404e6acb45`");
        await queryRunner.query("ALTER TABLE `question_answer` DROP FOREIGN KEY `FK_c098736a2c04bed5f144a62e770`");
        await queryRunner.query("ALTER TABLE `question_answer` DROP FOREIGN KEY `FK_1adf9ebd234bfde6fb88f0da94e`");
        await queryRunner.query("ALTER TABLE `question` DROP FOREIGN KEY `FK_3f7828c3b2c8db7b5e41cade66a`");
        await queryRunner.query("ALTER TABLE `group` DROP FOREIGN KEY `FK_39caf5d075ae8a8d384fda66951`");
        await queryRunner.query("ALTER TABLE `enrollment` DROP FOREIGN KEY `FK_d1a599a7740b4f4bd1120850f04`");
        await queryRunner.query("ALTER TABLE `enrollment` DROP FOREIGN KEY `FK_95738965b9e38fff53b20c4046d`");
        await queryRunner.query("DROP INDEX `IDX_93b1985a5a1f291b695c9024a7` ON `question_answer_checkbox_answer_question_option`");
        await queryRunner.query("DROP INDEX `IDX_cc1cb9589b3460bc242a8f06d5` ON `question_answer_checkbox_answer_question_option`");
        await queryRunner.query("DROP TABLE `question_answer_checkbox_answer_question_option`");
        await queryRunner.query("DROP INDEX `IDX_2a6f5b6f54ffea20e79d8092c4` ON `group_assignments_assignment`");
        await queryRunner.query("DROP INDEX `IDX_af9d37221f979bfd646d84ebc6` ON `group_assignments_assignment`");
        await queryRunner.query("DROP TABLE `group_assignments_assignment`");
        await queryRunner.query("DROP INDEX `IDX_c180b6dbe5df75d65af330f95b` ON `group_users_user`");
        await queryRunner.query("DROP INDEX `IDX_fe6cce7d479552c17823e267af` ON `group_users_user`");
        await queryRunner.query("DROP TABLE `group_users_user`");
        await queryRunner.query("DROP INDEX `IDX_7c52eb55423199bdfcaafc6d74` ON `user_organisation_unit_organisation_unit`");
        await queryRunner.query("DROP INDEX `IDX_7c86819087c1b50c998f76d96c` ON `user_organisation_unit_organisation_unit`");
        await queryRunner.query("DROP TABLE `user_organisation_unit_organisation_unit`");
        await queryRunner.query("DROP INDEX `IDX_9a0c50a833104bac44d4a15e37` ON `user_study_study`");
        await queryRunner.query("DROP INDEX `IDX_7b982e7b1038174bc289e8e4c1` ON `user_study_study`");
        await queryRunner.query("DROP TABLE `user_study_study`");
        await queryRunner.query("DROP INDEX `IDX_7cdc0d3f4cb516f0e15d621b9f` ON `user_affiliation_affiliation`");
        await queryRunner.query("DROP INDEX `IDX_c16e312cfa5a5519f335c4b637` ON `user_affiliation_affiliation`");
        await queryRunner.query("DROP TABLE `user_affiliation_affiliation`");
        await queryRunner.query("DROP TABLE `review_comment`");
        await queryRunner.query("DROP TABLE `submission_comment`");
        await queryRunner.query("DROP INDEX `IDX_61b91a5725a871eebd0897769e` ON `question_option`");
        await queryRunner.query("DROP TABLE `question_option`");
        await queryRunner.query("DROP TABLE `course`");
        await queryRunner.query("DROP INDEX `REL_01758965931ae6238fc2520539` ON `assignment`");
        await queryRunner.query("DROP INDEX `REL_df7f8ea69df0b2cd620801b526` ON `assignment`");
        await queryRunner.query("DROP INDEX `REL_8daf64977e5c3fd1df594b7abe` ON `assignment`");
        await queryRunner.query("DROP TABLE `assignment`");
        await queryRunner.query("DROP INDEX `REL_dec51148a6379ffdc1ea98fdb8` ON `submission`");
        await queryRunner.query("DROP TABLE `submission`");
        await queryRunner.query("DROP INDEX `IDX_370a04e24b73e4f2473b397729` ON `questionnaire`");
        await queryRunner.query("DROP TABLE `questionnaire`");
        await queryRunner.query("DROP INDEX `IDX_8edcfd5ea728371ad7debd6996` ON `review`");
        await queryRunner.query("DROP TABLE `review`");
        await queryRunner.query("DROP INDEX `IDX_24904f31379ef7d24ef3f1ab17` ON `question_answer`");
        await queryRunner.query("DROP INDEX `REL_94dea89fc7de3d4c33812ac013` ON `question_answer`");
        await queryRunner.query("DROP TABLE `question_answer`");
        await queryRunner.query("DROP INDEX `IDX_91578dceeb42466b9285f29e4b` ON `question`");
        await queryRunner.query("DROP TABLE `question`");
        await queryRunner.query("DROP TABLE `file`");
        await queryRunner.query("DROP TABLE `group`");
        await queryRunner.query("DROP TABLE `enrollment`");
        await queryRunner.query("DROP TABLE `academic_year`");
        await queryRunner.query("DROP TABLE `faculty`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP TABLE `organisation_unit`");
        await queryRunner.query("DROP TABLE `study`");
        await queryRunner.query("DROP TABLE `affiliation`");
    }

}
