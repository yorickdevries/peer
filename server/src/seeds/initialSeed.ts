import { Factory, Seeder } from "typeorm-seeding";
import { createStudents, createTeachers } from "../factories/User.factory";

export default class InitialDatabaseSeed implements Seeder {
  public async run(factory: Factory): Promise<void> {
    const students = await createStudents(factory);
    const teachers = await createTeachers(factory);

    console.log(students);
    console.log(teachers);
  }
}
