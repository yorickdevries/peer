import {Seeder} from "typeorm-seeding";
import {createUser} from "../factories/User.factory";
import {createDefaultFaculties} from "../factories/Faculty.factory";
import {createDefaultAcademicYears} from "../factories/AcademicYear.factory";
import {parseAndSaveAffiliation, parseAndSaveOrganisationUnit, parseAndSaveStudy,} from "../util/parseAndSaveSSOFields";
import {createCourse} from "../factories/Course.factory";
import {createAssignment} from "../factories/Assignment.factory";
import {createEnrollment} from "../factories/Enrollment.factory";
import {createAssignmentVersion} from "../factories/AssignmentVersion.factory";
import {createSubmissionQuestionnaire} from "../factories/SubmissionQuestionnaire.factory";
import AssignmentVersion from "../models/AssignmentVersion";
import {createOpenQuestion} from "../factories/OpenQuestion.factory";
import UserRole from "../enum/UserRole";
import {createReviewQuestionnaire} from "../factories/ReviewQuestionnaire.factory";
import User from "../models/User";
import {AssignmentState} from "../enum/AssignmentState";
import Course from "../models/Course";
import {createGroup} from "../factories/Group.factory";
import {createSubmission} from "../factories/Submission.factory";
import {createFile} from "../factories/File.factory";
import fsPromises from "fs/promises";
import config from "config";
import path from "path";
import Group from "../models/Group";
import publishAssignment from "../assignmentProgression/publishAssignment";
import closeSubmission from "../assignmentProgression/closeSubmission";
import {distributeReviewsForAssignment} from "../assignmentProgression/distributeReviews";
import Review from "../models/Review";
import Question from "../models/Question";
import QuestionType from "../enum/QuestionType";

const uploadFolder = path.resolve(config.get("uploadFolder") as string);
const exampleFile = path.join(
  uploadFolder,
  "..",
  "..",
  "exampleData",
  "assignments",
  "assignment1.pdf"
);

interface StagePlan {
  name: string;
  assignmentState: AssignmentState;
  groupsEnabled: boolean;
  course: Course;
}

function removeLate(num: number): number {
  return num - 2;
}

function getStudent(entity: User | User[]): User[] {
  return Array.isArray(entity) ? entity : [entity];
}

function answerQuestion(q: Question) {
  switch (q.type) {
    case QuestionType.OPEN: {

    }
  }
}

//users are allowed to submit
//submissions are closed but reviews are not open
//users are allowed to review
//users receive feedback on their submission
function getStagePlan(userCourse: Course, groupCourse: Course): StagePlan[] {
  return [
    {
      name: "student_submission",
      assignmentState: AssignmentState.SUBMISSION,
      groupsEnabled: false,
      course: userCourse,
    },
    {
      name: "student_waiting",
      assignmentState: AssignmentState.WAITING_FOR_REVIEW,
      groupsEnabled: false,
      course: userCourse,
    },
    {
      name: "student_review",
      assignmentState: AssignmentState.REVIEW,
      groupsEnabled: false,
      course: userCourse,
    },
    {
      name: "student_feedback",
      assignmentState: AssignmentState.FEEDBACK,
      groupsEnabled: false,
      course: userCourse,
    },
    {
      name: "group_submission",
      assignmentState: AssignmentState.SUBMISSION,
      groupsEnabled: true,
      course: groupCourse,
    },
    {
      name: "group_waiting",
      assignmentState: AssignmentState.WAITING_FOR_REVIEW,
      groupsEnabled: true,
      course: groupCourse,
    },
    {
      name: "group_review",
      assignmentState: AssignmentState.REVIEW,
      groupsEnabled: true,
      course: groupCourse,
    },
    {
      name: "group_feedback",
      assignmentState: AssignmentState.FEEDBACK,
      groupsEnabled: true,
      course: groupCourse,
    },
  ];
}

export default class InitialDatabaseSeed implements Seeder {
  public async run(): Promise<void> {
    const exportJSON: any = {};

    //Generate utils
    const employeeAffiliation = await parseAndSaveAffiliation("employee");
    const studentAffiliation = await parseAndSaveAffiliation("student");
    const study = await parseAndSaveStudy("M Computer Science");
    const org = await parseAndSaveOrganisationUnit(
      "Electrical Engineering, Mathematics and Computer Science"
    );

    //Generate group users
    const students: User[] = await Promise.all(
      [...Array(40)].map(async () => {
        return await createUser({
          organisationUnit: org,
          study,
          affiliation: studentAffiliation,
        });
      })
    );

    //Generate groups
    const groups = Array(students.length / 2);
    for (let i = 0; i < groups.length; i++) {
      groups[i] = [students[i * 2], students[i * 2 + 1]];
    }

    const teachers = await Promise.all(
      [...Array(2)].map(async () => {
        return await createUser({
          organisationUnit: org,
          study,
          affiliation: employeeAffiliation,
        });
      })
    );
    const studentTeacher = teachers[0];
    exportJSON["studentTeacher"] = studentTeacher.netid;

    const groupTeacher = teachers[1];
    exportJSON["groupTeacher"] = groupTeacher.netid;

    //Generate academic years
    const years = await createDefaultAcademicYears();
    //Generate faculties
    const faculties = await createDefaultFaculties();

    //Generate student course
    const studentCourse = await createCourse({
      faculty: faculties[0],
      academicYear: years[0],
      name: "Students (seed)",
    });

    //Generate student course
    const groupCourse = await createCourse({
      faculty: faculties[1],
      academicYear: years[1],
      name: "Groups (seed)",
    });

    const courses: Course[] = [studentCourse, groupCourse];

    //Assign student teacher
    await createEnrollment({
      course: studentCourse,
      user: studentTeacher,
      role: UserRole.TEACHER,
    });

    //Assign group teacher
    await createEnrollment({
      course: groupCourse,
      user: groupTeacher,
      role: UserRole.TEACHER,
    });

    for (const course of courses) {
      //Assign students
      for (const s of students) {
        await createEnrollment({
          course: course,
          user: s,
          role: UserRole.STUDENT,
        });
      }
    }

    const plan = getStagePlan(studentCourse, groupCourse).slice(4, 6);

    for (const schema of plan) {
      exportJSON[schema.name] = {};
      const schemaStudents = schema.groupsEnabled ? groups : students;
      let numSubmittingEntities = schemaStudents.length;

      //Generate assignment
      const assignment = await createAssignment({
        course: schema.course,
        name: schema.name,
        reviewEvaluation: false,
        reviewEvaluationDueDate: null,
        lateReviewEvaluations: null,
        submissionExtensions: ".pdf",
      });

      const userGroups: Group[] = [];
      //Enroll students/groups in assignment
      for (const entity of schemaStudents) {
        const group = await createGroup({
          course: schema.course,
          users: getStudent(entity),
          assignments: [assignment],
        });
        userGroups.push(group);
      }

      //Generate assignment version
      let assignmentVersion = await createAssignmentVersion({
        name: "default",
        assignment: assignment,
      });

      //Generate submission questionnaire
      const submissionQuestionnaire = await createSubmissionQuestionnaire({
        assignmentVersionOfSubmissionQuestionnaire: assignmentVersion,
      });

      //Generate submission questionnaire questions
      await Promise.all(
        [...Array(5)].map(async (_, i) => {
          await createOpenQuestion({
            number: i + 1,
            questionnaire: submissionQuestionnaire,
          });
        })
      );

      if (assignment.reviewEvaluation) {
        //Generate review questionnaire
        const reviewQuestionnaire = await createReviewQuestionnaire({
          assignmentVersionOfReviewQuestionnaire: assignmentVersion,
        });

        //Generate review questionnaire questions
        await Promise.all(
          [...Array(5)].map(async (_, i) => {
            await createOpenQuestion({
              number: i + 1,
              questionnaire: reviewQuestionnaire,
            });
          })
        );

        assignmentVersion.reviewQuestionnaire = reviewQuestionnaire;
      }

      assignmentVersion.submissionQuestionnaire = submissionQuestionnaire;
      assignmentVersion.versionsToReview = [assignmentVersion];
      assignmentVersion = await AssignmentVersion.save(assignmentVersion);

      //Publish assignment
      await publishAssignment(assignment.id);

      //Submit assignment
      numSubmittingEntities = removeLate(numSubmittingEntities);
      for (let i = 0; i < numSubmittingEntities; i++) {
        const file = await createFile({});
        await fsPromises.copyFile(
          exampleFile,
          path.join(uploadFolder, file.id.toString())
        );
        await createSubmission({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          user: userGroups[i].users![0],
          group: userGroups[i],
          assignmentVersion: assignmentVersion,
          file: file,
        });
      }

      await closeSubmission(assignment.id);
      await distributeReviewsForAssignment(assignment.id);

      //Review Assignment
      numSubmittingEntities = removeLate(numSubmittingEntities);
      for (let i = 0; i < numSubmittingEntities; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const user of userGroups[i].users!) {
          const reviews: Review[] =
            await submissionQuestionnaire.getReviewsWhereUserIsReviewer(user);
          for (const review of reviews) {
            review.questionnaire?.questions.forEach((q) => {
              answerQuestion(q);
            })
          }
        }
      }

      //Get Feedback Assignment

      //Review Feedback Assignment
      console.log("\n\nSEED INFORMATION");
      console.log(JSON.stringify(exportJSON, null, 1));
    }
  }
}
