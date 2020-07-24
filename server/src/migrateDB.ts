import "reflect-metadata"; // needed for typeORM to work
import { createConnection } from "typeorm";
import * as ormconfig from "./ormconfig";
// import parseNetID from "./util/parseNetID";
// import saveUserFromSSO from "./util/saveUserFromSSO";
// import { PreparedStatement } from "pg-promise";
// import Database from "./old_api/database";
import AcademicYear from "./models/AcademicYear";
import Faculty from "./models/Faculty";

const migrateDB = async function (): Promise<void> {
  console.log("Start migration");

  // database connection with mysql database
  const connection = await createConnection(ormconfig);
  console.log(connection.name);

  /*
   * User,
   * Affiliation,
   * Study,
   * OrganisationUnit,
   */
  // get all users
  /*
  const userStatement = new PreparedStatement({
    name: "users",
    text: 'SELECT * FROM "userlist"',
  });
  const oldUsers = await Database.executeQuery(userStatement);
  console.log("num users:", oldUsers.length);

  // parse the postgres syntax for lists
  const replacePostgresSyntax = function (name?: string | string[]) {
    if (typeof name === "string") {
      // replace postgres syntax
      if (name.startsWith("{") && name.endsWith("}")) {
        name = name.replace("{", "[");
        name = name.replace("}", "]");
        name = JSON.parse(name);
      }
      return name;
    } else if (name === undefined) {
      return undefined;
    } else {
      throw new Error("incorrect name: " + name);
    }
  };

  const newUsers: (string | undefined)[] = [];
  for (const oldUser of oldUsers) {
    const netid: string = parseNetID(oldUser.netid);
    const studentNumber: number | undefined = oldUser.studentnumber
      ? oldUser.studentnumber
      : undefined;
    const firstName: string | undefined = oldUser.firstname
      ? oldUser.firstname
      : undefined;
    const prefix: string | undefined = oldUser.prefix
      ? oldUser.prefix
      : undefined;
    const lastName: string | undefined = oldUser.lastname
      ? oldUser.lastname
      : undefined;
    const email: string | undefined = oldUser.email ? oldUser.email : undefined;
    const displayName: string | undefined = oldUser.displayname
      ? oldUser.displayname
      : undefined;
    let affiliation: string | string[] | undefined = oldUser.affiliation
      ? oldUser.affiliation
      : undefined;
    affiliation = replacePostgresSyntax(affiliation);
    let study: string | string[] | undefined = oldUser.study
      ? oldUser.study
      : undefined;
    study = replacePostgresSyntax(study);
    let organisationUnit:
      | string
      | string[]
      | undefined = oldUser.organisationunit
      ? oldUser.organisationunit
      : undefined;
    organisationUnit = replacePostgresSyntax(organisationUnit);

    // save user and fields to the database
    const savedNetid = await saveUserFromSSO(
      netid,
      studentNumber,
      firstName,
      prefix,
      lastName,
      email,
      displayName,
      affiliation,
      study,
      organisationUnit
    );
    if (newUsers.includes(savedNetid)) {
      throw new Error(`${savedNetid} is a duplicate`);
    }
    newUsers.push(savedNetid);
  }
  console.log(`saved ${newUsers.length} users`);
  */

  /*
   * Faculty,
   */
  // const facultyStatement = new PreparedStatement({
  //   name: "faculties",
  //   text: 'SELECT * FROM "facultylist"',
  // });
  // const oldFaculties = await Database.executeQuery(facultyStatement);
  // console.log(oldFaculties);

  // map to convert the previous names to the new objects
  const facultyMap = {
    EWI: await new Faculty(
      "EEMCS",
      "Electrical Engineering, Mathematics & Computer Science"
    ).save(),
    "3ME": await new Faculty(
      "3mE",
      "Mechanical, Maritime and Materials Engineering"
    ).save(),
    TNW: await new Faculty("AS", "Applied Sciences").save(),
    TBM: await new Faculty("TPM", "Technology, Policy and Management").save(),
    BK: await new Faculty(
      "ABE",
      "Architecture and the Built Environment"
    ).save(),
    CITG: await new Faculty("CEG", "Civil Engineering and Geosciences").save(),
    IO: await new Faculty("IDE", "Industrial Design Engineering").save(),
    LR: await new Faculty("AE", "Aerospace Engineering").save(),
  };
  console.log(facultyMap);

  /*
   * AcademicYear,
   */
  // const academicYearStatement = new PreparedStatement({
  //   name: "AcademicYearList",
  //   text: 'SELECT * FROM "academicyearlist"',
  // });
  // const oldAcademicYears = await Database.executeQuery(academicYearStatement);
  // console.log(oldAcademicYears);

  // map to convert the previous names to the new objects
  const academicYearMap = {
    "2018/2019": await new AcademicYear("2018/2019", false).save(),
    "2019/2020": await new AcademicYear("2019/2020", true).save(),
    "2020/2021": await new AcademicYear("2020/2021", true).save(),
  };
  console.log(academicYearMap);

  // Course,
  // Enrollment,
  // Assignment,
  // File,
  // Group,
  // Submission,
  // Questionnaire,
  // SubmissionQuestionnaire,
  // ReviewQuestionnaire,
  // Question,
  // CheckboxQuestion,
  // MultipleChoiceQuestion,
  // OpenQuestion,
  // RangeQuestion,
  // UploadQuestion,
  // QuestionOption,
  // CheckboxQuestionOption,
  // MultipleChoiceQuestionOption,
  // Review,
  // ReviewOfSubmission,
  // ReviewOfReview,
  // QuestionAnswer,
  // CheckboxQuestionAnswer,
  // MultipleChoiceQuestionAnswer,
  // OpenQuestionAnswer,
  // RangeQuestionAnswer,
  // UploadQuestionAnswer,
  // SubmissionComment,
  // ReviewComment,

  console.log("Done migration");
  return;
};

migrateDB()
  .then(() => {
    console.log("finished succesfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    console.log("did not finish succesfully");
    process.exit(0);
  });
