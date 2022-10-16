import { Seeder } from "typeorm-seeding";
import { createUser } from "../factories/User.factory";
import { createDefaultFaculties } from "../factories/Faculty.factory";
import { createDefaultAcademicYears } from "../factories/AcademicYear.factory";
import {
  parseAndSaveAffiliation,
  parseAndSaveOrganisationUnit,
  parseAndSaveStudy,
} from "../util/parseAndSaveSSOFields";
import { createCourse } from "../factories/Course.factory";
import { createAssignment } from "../factories/Assignment.factory";

export default class InitialDatabaseSeed implements Seeder {
  public async run(): Promise<void> {
    //Generate utils
    const employeeAffiliation = await parseAndSaveAffiliation("employee");
    const studentAffiliation = await parseAndSaveAffiliation("student");
    const study = await parseAndSaveStudy("M Computer Science");
    const org = await parseAndSaveOrganisationUnit(
      "Electrical Engineering, Mathematics and Computer Science"
    );

    //Generate users
    const students = await Promise.all(
      [...Array(10)].map(async () => {
        return await createUser({
          organisationUnit: org,
          study,
          affiliation: studentAffiliation,
        });
      })
    );

    const teachers = await Promise.all(
      [...Array(10)].map(async () => {
        return await createUser({
          organisationUnit: org,
          study,
          affiliation: employeeAffiliation,
        });
      })
    );
    const mainTeacher = teachers[0];

    //Generate academic years
    const years = await createDefaultAcademicYears();
    //Generate faculties
    const faculties = await createDefaultFaculties();

    //Generate first course
    const c1 = await createCourse({
      faculty: faculties[0],
      academicYear: years[0],
    });

    //Assign main teacher to first course

    //Generate first assignment
    const a1 = await createAssignment({
      course: c1,
    });

    console.log(students, teachers, faculties, years, c1, a1, mainTeacher);
  }
}
