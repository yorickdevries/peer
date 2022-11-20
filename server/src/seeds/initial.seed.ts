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
import UserRole from "../enum/UserRole";
import { createReviewQuestionnaire } from "../factories/ReviewQuestionnaire.factory";
import User from "../models/User";
import { AssignmentState, assignmentStateOrder } from "../enum/AssignmentState";
import Course from "../models/Course";
import { createGroup } from "../factories/Group.factory";
import { createSubmission } from "../factories/Submission.factory";
import { createFile } from "../factories/File.factory";
import fsPromises from "fs/promises";
import config from "config";
import path from "path";
import Group from "../models/Group";
import publishAssignment from "../assignmentProgression/publishAssignment";
import closeSubmission from "../assignmentProgression/closeSubmission";
import { distributeReviewsForAssignment } from "../assignmentProgression/distributeReviews";
import Review from "../models/Review";
import Question from "../models/Question";
import QuestionType from "../enum/QuestionType";
import { createOpenQuestionAnswer } from "../factories/OpenQuestionAnswer.factory";
import submitReview from "../util/submitReview";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import openFeedback from "../assignmentProgression/openFeedback";
import moment from "moment";
import { createRangeQuestion } from "../factories/RangeQuestion.factory";
import Questionnaire from "../models/Questionnaire";
import { createRangeQuestionAnswer } from "../factories/RangeQuestionAnswer.factory";
import RangeQuestion from "../models/RangeQuestion";
import Submission from "../models/Submission";

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
  reviewQuestionnaire?: boolean;
}

/**
 * Removes a set number from another number.
 *
 * @param num - The start number
 *
 * @returns The new number with the set number subtracted
 */
function removeLate(num: number): number {
  return num - 2;
}

/**
 * Encases a given user in an array, if not already an array.
 *
 * @param entity - A user or array of users
 *
 * @returns The encased user or multiple user
 */
function getStudent(entity: User | User[]): User[] {
  return Array.isArray(entity) ? entity : [entity];
}

/**
 * Answers a given question and saves to the DB.
 *
 * @param question - The question to answer
 * @param review - The review associated with this question answer
 */
async function answerQuestion(question: Question, review: Review) {
  switch (question.type) {
    case QuestionType.OPEN: {
      await createOpenQuestionAnswer({
        question,
        review,
      });
      break;
    }
    case QuestionType.RANGE: {
      await createRangeQuestionAnswer({
        question,
        review,
        rangeAnswer: Math.max(
          1,
          Math.floor(Math.random() * (question as RangeQuestion).range)
        ),
      });
      break;
    }
  }
}

/**
 * Generates questions for a specific questionnaire.
 *
 * @param questionnaire - The questionnaire to generate questions for
 */
async function generateQuestionnaireQuestions(questionnaire: Questionnaire) {
  await createOpenQuestion({
    number: 1,
    questionnaire: questionnaire,
  });
  await createRangeQuestion({
    number: 2,
    questionnaire: questionnaire,
  });
}

/**
 * Checks if an assignment state is at or before another state.
 *
 * @param orig - The original state
 * @param after - The state to check
 *
 * @returns If the current state if before or equal to the passed state
 */
function isBeforeState(orig: AssignmentState, after: AssignmentState) {
  const currentStateIndex = assignmentStateOrder.indexOf(orig);
  const otherStateIndex = assignmentStateOrder.indexOf(after);
  return currentStateIndex <= otherStateIndex;
}

//in minutes
/**
 * Gives a random time skew value based on its position in the array
 *
 * @param p - The numbers position
 *
 * @returns the time skew in minutes
 */
function skewTimes(p: number): number {
  return Math.pow(p, 1.5);
}

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
      reviewQuestionnaire: true,
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
      reviewQuestionnaire: true,
    },
  ];
}

export default class InitialDatabaseSeed implements Seeder {
  public async run(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exportJSON: any = {};

    //Generate utils
    const employeeAffiliation = await parseAndSaveAffiliation("employee");
    const studentAffiliation = await parseAndSaveAffiliation("student");
    const study = await parseAndSaveStudy("M Computer Science");
    const org = await parseAndSaveOrganisationUnit(
      "Electrical Engineering, Mathematics and Computer Science"
    );

    //Generate users
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

    //Assign students to each course
    for (const course of courses) {
      for (const s of students) {
        await createEnrollment({
          course: course,
          user: s,
          role: UserRole.STUDENT,
        });
      }
    }

    const plan = getStagePlan(studentCourse, groupCourse);

    //Iterate through each stage (schema) of the plan
    for (const schema of plan) {
      exportJSON[schema.name] = {};
      const schemaStudents = schema.groupsEnabled ? groups : students;
      let numSubmittingEntities = schemaStudents.length; //number of groups / students

      //Generate assignment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const assignmentOverride: any = {
        course: schema.course,
        name: schema.name,
        submissionExtensions: ".pdf",
      };

      if (schema.reviewQuestionnaire === undefined) {
        assignmentOverride.reviewEvaluation = false;
        assignmentOverride.reviewEvaluationDueDate = null;
        assignmentOverride.lateReviewEvaluations = null;
      }
      const assignment = await createAssignment(assignmentOverride);

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
      await generateQuestionnaireQuestions(submissionQuestionnaire);

      if (assignment.reviewEvaluation) {
        //Generate review questionnaire
        const reviewQuestionnaire = await createReviewQuestionnaire({
          assignmentVersionOfReviewQuestionnaire: assignmentVersion,
        });

        //Generate review questionnaire questions
        await generateQuestionnaireQuestions(reviewQuestionnaire);

        assignmentVersion.reviewQuestionnaire = reviewQuestionnaire;
      }

      assignmentVersion.submissionQuestionnaire = submissionQuestionnaire;
      assignmentVersion.versionsToReview = [assignmentVersion];
      assignmentVersion = await AssignmentVersion.save(assignmentVersion);

      //Publish assignment
      await publishAssignment(assignment.id);

      if (!isBeforeState(AssignmentState.SUBMISSION, schema.assignmentState)) {
        continue;
      }

      //Submit assignment
      numSubmittingEntities = removeLate(numSubmittingEntities);
      for (let i = 0; i < numSubmittingEntities; i++) {
        const file = await createFile({});
        await fsPromises.copyFile(
          exampleFile,
          path.join(uploadFolder, file.id.toString())
        );
        const submission = await createSubmission({
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          user: userGroups[i].users![0],
          group: userGroups[i],
          assignmentVersion: assignmentVersion,
          file: file,
        });

        //Set submission time
        const submissionMoment = moment(assignment.dueDate).subtract(
          skewTimes(i),
          "minutes"
        );

        submission.createdAt = submissionMoment.toDate();
        await Submission.save(submission);
      }

      if (
        !isBeforeState(
          AssignmentState.WAITING_FOR_REVIEW,
          schema.assignmentState
        )
      ) {
        continue;
      }

      await closeSubmission(assignment.id);

      if (!isBeforeState(AssignmentState.REVIEW, schema.assignmentState)) {
        continue;
      }

      await distributeReviewsForAssignment(assignment.id);

      //Review Assignment
      numSubmittingEntities = removeLate(numSubmittingEntities);
      for (let i = 0; i < numSubmittingEntities; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const user of userGroups[i].users!) {
          const reviews: Review[] =
            await submissionQuestionnaire.getReviewsWhereUserIsReviewer(user);
          for (const review of reviews) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const questionnaire = await SubmissionQuestionnaire.findOneOrFail({
              where: { id: review.questionnaireId },
            });
            //Answer questions
            for (const question of questionnaire.questions) {
              await answerQuestion(question, review);
            }
            await submitReview(review, false);

            //Set review submission time
            const submissionMoment = moment(assignment.reviewDueDate).subtract(
              skewTimes(i),
              "minutes"
            );
            const startMoment = moment(submissionMoment).subtract(
              skewTimes(numSubmittingEntities - i),
              "minutes"
            );

            await review.reload();
            review.submittedAt = submissionMoment.toDate();
            review.startedAt = startMoment.toDate();
            await Review.save(review);
          }
        }
      }

      //Get Feedback Assignment
      if (!isBeforeState(AssignmentState.FEEDBACK, schema.assignmentState)) {
        continue;
      }

      await openFeedback(assignment.id);

      //Review Feedback Assignment
      if (assignment.reviewEvaluation) {
        numSubmittingEntities = removeLate(numSubmittingEntities);
        for (let i = 0; i < numSubmittingEntities; i++) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          for (const user of userGroups[i].users!) {
            const reviews: Review[] =
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              await assignmentVersion.reviewQuestionnaire!.getReviewsWhereUserIsReviewer(
                user
              );
            for (const review of reviews) {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              const questionnaire = await ReviewQuestionnaire.findOneOrFail({
                where: { id: review.questionnaireId },
              });
              //Answer questions
              for (const question of questionnaire.questions) {
                await answerQuestion(question, review);
              }
              await submitReview(review, false);
            }
          }
        }
      }
    }
    console.log("\n\nSEED INFORMATION");
    console.log(JSON.stringify(exportJSON, null, 1));
  }
}
