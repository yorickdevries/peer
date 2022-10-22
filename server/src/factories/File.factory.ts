import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import { ContainsKey } from "../util/seedData";
import File from "../models/File";

async function createFile(
  override: ContainsKey<File>
): Promise<File> {
  return await factory(File)().create(override);
}

define(File, (faker: typeof Faker) => {
  const name = faker.commerce.productName();
  const extension = ".pdf";

  return new File(name, extension, null);
});

export { createFile };
