import User from "../models/User";
import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import parseNetID from "../util/parseNetID";
import { ContainsKey } from "../util/seedData";

async function createUser(override: ContainsKey<User>): Promise<User> {
  return await factory(User)().create(override);
}

define(User, (faker: typeof Faker) => {
  const studentNumber = faker.random.number({ min: 1, max: 9999999 });
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const netId = `${firstName.charAt(0)}${lastName}${faker.random.number({
    min: 1,
    max: 15,
  })}`;
  const email = faker.internet.email(firstName, lastName, "tudelft.nl");

  return new User(
    parseNetID(netId),
    undefined,
    undefined,
    undefined,
    studentNumber,
    firstName,
    null,
    lastName,
    email,
    netId
  );
});

export { createUser };
