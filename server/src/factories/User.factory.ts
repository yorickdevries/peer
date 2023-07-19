import User from "../models/User";
import parseNetID from "../util/parseNetID";
import { ContainsKey } from "../util/seedData";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { faker } from "@faker-js/faker";
import { dataSource } from "../databaseConnection";

async function createUser(override: ContainsKey<User>): Promise<User> {
  return await new UserFactory().create(override);
}

export { createUser };

export class UserFactory extends Factory<User> {
  protected entity = User;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<User> {
    const studentNumber = faker.number.int({ min: 1, max: 9999999 });
    const firstName = faker.person.firstName().replace(/[^a-zA-Z]/, "");
    const lastName = faker.person.lastName().replace(/[^a-zA-Z]/, "");
    const displayName = `${firstName} ${lastName}`;
    const netId = `${firstName.charAt(0)}${lastName}${faker.number.int({
      min: 1,
      max: 15,
    })}`;
    const email = faker.internet.email({
      firstName: firstName,
      lastName: lastName,
      provider: "tudelft.nl",
    });

    return new User().init({
      netid: parseNetID(netId),
      affiliation: undefined,
      study: undefined,
      organisationUnit: undefined,
      studentNumber: studentNumber,
      firstName: firstName,
      prefix: null,
      lastName: lastName,
      email: email,
      displayName: displayName,
    });
  }
}
