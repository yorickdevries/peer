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
import { createEnrollment } from "../factories/Enrollment.factory";
import { createAssignmentVersion } from "../factories/AssignmentVersion.factory";
import { createSubmissionQuestionnaire } from "../factories/SubmissionQuestionnaire.factory";
import AssignmentVersion from "../models/AssignmentVersion";
import { createOpenQuestion } from "../factories/OpenQuestion.factory";

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

    //Generate course
    const c1 = await createCourse({
      faculty: faculties[0],
      academicYear: years[0],
    });

    //Generate assignment
    const a1 = await createAssignment({
      course: c1,
    });

    //Generate assignment version
    let av1 = await createAssignmentVersion({
      name: "default",
      assignment: a1,
    });

    //Generate submission questionnaire
    const sq1 = await createSubmissionQuestionnaire({
      assignmentVersionOfSubmissionQuestionnaire: av1,
    });

    //Generate submission questionnaire questions
    await Promise.all(
      [...Array(5)].map(async (_, i) => {
        await createOpenQuestion({
          number: i + 1,
          questionnaire: sq1,
        });
      })
    );

    av1.submissionQuestionnaire = sq1;
    av1 = await AssignmentVersion.save(av1);

    //Assign teacher
    await createEnrollment({
      course: c1,
      user: mainTeacher,
    });

    //Assign students
    for (const s of students) {
      await createEnrollment({
        course: c1,
        user: s,
      });
    }
  }
}
