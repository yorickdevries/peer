import User from "../models/User";
import { define, Factory } from "typeorm-seeding";
import Faker from "faker";
import parseNetID from "../util/parseNetID";
import {
  parseAndSaveAffiliation,
  parseAndSaveOrganisationUnit,
  parseAndSaveStudy,
} from "../util/parseAndSaveSSOFields";

async function setProperties(
  user: User,
  affilitation: string,
  study: string,
  org: string
) {
  user.affiliation = await parseAndSaveAffiliation(affilitation);
  user.study = await parseAndSaveStudy(study);
  user.organisationUnit = await parseAndSaveOrganisationUnit(org);
}

async function createStudents(factory: Factory): Promise<User[]> {
  const students = await factory(User)()
    .map(async (user: User) => {
      await setProperties(
        user,
        "student",
        "M Computer Science and Engineering",
        "EEMCS"
      );
      return user;
    })
    .createMany(5);
  return students;
}

async function createTeachers(factory: Factory): Promise<User[]> {
  const teachers = await factory(User)()
    .map(async (user: User) => {
      await setProperties(
        user,
        "employee",
        "M Computer Science and Engineering",
        "EEMCS"
      );
      return user;
    })
    .createMany(2);
  return teachers;
}

define(User, (faker: typeof Faker) => {
  const studentNumber = faker.random.number({ min: 1, max: 9999999 });
  const firstName = faker.name.firstName();
  const lastName = faker.name.lastName();
  const netId = `${firstName.charAt(0)}${lastName}${faker.random.number({
    min: 1,
    max: 15,
  })}`;
  const email = faker.internet.email(firstName, lastName, "tudelft.nl");

  return new User(
    parseNetID(netId),
    undefined,
    undefined,
    undefined,
    //await parseAndSaveAffiliation("employee"),
    //await parseAndSaveStudy("M Computer Science"),
    //await parseAndSaveOrganisationUnit("Electrical Engineering, Mathematics and Computer Science"),
    studentNumber,
    firstName,
    null,
    lastName,
    email,
    netId
  );
});

export { setProperties, createStudents, createTeachers };