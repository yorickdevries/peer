import { faker } from "@faker-js/faker";
import { ContainsKey } from "../util/seedData";
import File from "../models/File";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

async function createFile(override: ContainsKey<File>): Promise<File> {
  return await new FileFactory().create(override);
}

export { createFile };

export class FileFactory extends Factory<File> {
  protected entity = File;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<File> {
    const name = faker.commerce.productName();
    const extension = ".pdf";

    return new File().init({ name: name, extension: extension, hash: null });
  }
}
