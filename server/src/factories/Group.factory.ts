import { ContainsKey } from "../util/seedData";
import User from "../models/User";
import Course from "../models/Course";
import Group from "../models/Group";
import Assignment from "../models/Assignment";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { faker } from "@faker-js/faker";
import { dataSource } from "../databaseConnection";

async function createGroup(override: ContainsKey<Group>): Promise<Group> {
  return await new GroupFactory().create(override);
}

export { createGroup };

export class GroupFactory extends Factory<Group> {
  protected entity = Group;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<Group> {
    const name = faker.commerce.productName();
    const course = Object.create(Course);
    const users = [Object.create(User)];
    const assignments = [Object.create(Assignment)];

    return new Group().init({
      name: name,
      course: course,
      users: users,
      assignments: assignments,
    });
  }
}
