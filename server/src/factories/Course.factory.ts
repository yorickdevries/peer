import Course from "../models/Course";
import Faculty from "../models/Faculty";
import AcademicYear from "../models/AcademicYear";
import { ContainsKey, coursePrefix } from "../util/seedData";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { faker } from "@faker-js/faker";
import { dataSource } from "../databaseConnection";

async function createCourse(override: ContainsKey<Course>): Promise<Course> {
  return new CourseFactory().create(override);
}

export { createCourse };

export class CourseFactory extends Factory<Course> {
  protected entity = Course;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<Course> {
    const courseName = `${faker.hacker.noun()} ${faker.hacker.ingverb()}`;
    const courseCode = `${coursePrefix()}${faker.number.int({
      min: 1000,
      max: 9999,
    })}`;
    const enrollable = true;
    const faculty = Object.create(Faculty);
    const year = Object.create(AcademicYear);
    const desc = faker.lorem.sentence();

    return new Course().init({
      name: courseName,
      courseCode: courseCode,
      enrollable: enrollable,
      faculty: faculty,
      academicYear: year,
      description: desc,
    });
  }
}
