import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import { ContainsKey } from "../util/seedData";
import Enrollment from "../models/Enrollment";
import User from "../models/User";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";

async function createEnrollment(
  override: ContainsKey<Enrollment>
): Promise<Enrollment> {
  return await factory(Enrollment)().create(override);
}

define(Enrollment, (faker: typeof Faker) => {
  const user = Object.create(User);
  const course = Object.create(Course);
  const role = faker.helpers.randomize([
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.TEACHING_ASSISTANT,
  ]);

  return new Enrollment(user, course, role);
});

export { createEnrollment };
