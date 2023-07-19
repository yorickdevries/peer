import { faker } from "@faker-js/faker";
import { ContainsKey } from "../util/seedData";
import Enrollment from "../models/Enrollment";
import User from "../models/User";
import Course from "../models/Course";
import UserRole from "../enum/UserRole";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

async function createEnrollment(
  override: ContainsKey<Enrollment>
): Promise<Enrollment> {
  return new EnrollmentFactory().create(override);
}

export { createEnrollment };

export class EnrollmentFactory extends Factory<Enrollment> {
  protected entity = Enrollment;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<Enrollment> {
    const user = Object.create(User);
    const course = Object.create(Course);
    const role = faker.helpers.arrayElement([
      UserRole.STUDENT,
      UserRole.TEACHER,
      UserRole.TEACHING_ASSISTANT,
    ]);

    return new Enrollment().init({ user: user, course: course, role: role });
  }
}
