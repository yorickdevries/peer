import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import { ContainsKey } from "../util/seedData";
import User from "../models/User";
import Course from "../models/Course";
import Group from "../models/Group";
import Assignment from "../models/Assignment";

async function createGroup(override: ContainsKey<Group>): Promise<Group> {
  return await factory(Group)().create(override);
}

define(Group, (faker: typeof Faker) => {
  const name = faker.commerce.productName();
  const course = Object.create(Course);
  const users = [Object.create(User)];
  const assignments = [Object.create(Assignment)];

  return new Group(name, course, users, assignments);
});

export { createGroup };
