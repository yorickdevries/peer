import { Factory, Seeder } from "typeorm-seeding";
import { createStudents, createTeachers } from "../factories/User.factory";
import { createFaculties } from "../factories/Faculty.factory";
import { createAcademicYears } from "../factories/AcademicYear.factory";

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    //Generate users
    const students = await createStudents(factory);
    const teachers = await createTeachers(factory);

    //Generate academic years
    const years = await createAcademicYears();
    //Generate faculties
    const faculties = await createFaculties();

    console.log(students, teachers, faculties, years);
  }
}
