import {MigrationInterface, QueryRunner} from "typeorm";
import User from "../models/User";
import Preferences from "../models/Preferences";

export class addPreferences1675513981228 implements MigrationInterface {
    name = 'addPreferences1675513981228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `preferences` (`createdAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updatedAt` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `id` int NOT NULL AUTO_INCREMENT, `stRemStageNotSubmitted` tinyint NOT NULL DEFAULT 1, `stRemLateSubmission` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `user` ADD `preferencesId` int NULL");
        await queryRunner.query("ALTER TABLE `user` ADD UNIQUE INDEX `IDX_8e0bb2d261fc46c8fd01333371` (`preferencesId`)");
        await queryRunner.query("CREATE UNIQUE INDEX `REL_8e0bb2d261fc46c8fd01333371` ON `user` (`preferencesId`)");
        await queryRunner.query("ALTER TABLE `user` ADD CONSTRAINT `FK_8e0bb2d261fc46c8fd013333712` FOREIGN KEY (`preferencesId`) REFERENCES `preferences`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");

        const allExistingUsers = await queryRunner.manager.find(User);

        for (const user of allExistingUsers) {
            const preferences = new Preferences()
            await queryRunner.manager.save(preferences)

            user.preferences = preferences;
            await queryRunner.manager.save(user)
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user` DROP FOREIGN KEY `FK_8e0bb2d261fc46c8fd013333712`");
        await queryRunner.query("DROP INDEX `REL_8e0bb2d261fc46c8fd01333371` ON `user`");
        await queryRunner.query("ALTER TABLE `user` DROP INDEX `IDX_8e0bb2d261fc46c8fd01333371`");
        await queryRunner.query("ALTER TABLE `user` DROP COLUMN `preferencesId`");
        await queryRunner.query("DROP TABLE `preferences`");
    }

}
