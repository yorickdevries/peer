import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import Course from "../models/Course";
import Faculty from "../models/Faculty";
import AcademicYear from "../models/AcademicYear";
import { ContainsKey, coursePrefix } from "../util/seedData";

async function createCourse(override: ContainsKey<Course>): Promise<Course> {
  return await factory(Course)().create(override);
}

define(Course, (faker: typeof Faker) => {
  const courseName = `${faker.hacker.noun()} ${faker.hacker.ingverb()}`;
  const courseCode = `${coursePrefix()}${faker.random.number({
    min: 1000,
    max: 9999,
  })}`;
  const enrollable = true;
  const faculty = Object.create(Faculty);
  const year = Object.create(AcademicYear);
  const desc = faker.lorem.sentence();

  return new Course(courseName, courseCode, enrollable, faculty, year, desc);
});

export { createCourse };
