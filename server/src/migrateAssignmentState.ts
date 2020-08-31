import "reflect-metadata"; // needed for typeORM to work
import { createConnection } from "typeorm";
import * as ormconfig from "./ormconfig";
import Assignment from "./models/Assignment";
import { AssignmentState } from "./enum/AssignmentState";
import CheckboxQuestion from "./models/CheckboxQuestion";
import MultipleChoiceQuestion from "./models/MultipleChoiceQuestion";
import Questionnaire from "./models/Questionnaire";
// import User from "./models/User";
// import Enrollment from "./models/Enrollment";
// import Course from "./models/Course";
// import UserRole from "./enum/UserRole";

const checkQuestionnaire = function (questionnaire: Questionnaire) {
  // CHECK VALIDITY OF QUESTIONNAIRE
  for (const question of questionnaire.questions) {
    if (
      question instanceof CheckboxQuestion ||
      question instanceof MultipleChoiceQuestion
    ) {
      if (question.options.length === 0) {
        throw new Error(
          "One of the questions in the questionnaire doesn't have options"
        );
      }
    }
  }
  return;
};

const migrateDB = async function (): Promise<void> {
  console.log("Start migration");

  // database connection with mysql database
  const connection = await createConnection(ormconfig);
  console.log(connection.name);

  // const test = false;
  // if (test) {
  //   const admin = await User.findOneOrFail("administrator");
  //   const courses = await Course.find();
  //   for (const course of courses) {
  //     const enr = new Enrollment(admin, course, UserRole.TEACHER);
  //     await enr.save();
  //   }
  // }

  const assignments = await Assignment.find();
  for (const assignment of assignments) {
    //console.log(assignment.id);
    // default
    let state = AssignmentState.UNPUBLISHED;
    let reviews = [];
    let reviewsof = [];
    const submissions = await assignment.getLatestSubmissionsOfEachGroup();
    if (submissions.length > 0) {
      // if there are submissions, we should be in submission state
      state = AssignmentState.SUBMISSION;
      // close submission as well
      state = AssignmentState.WAITING_FOR_REVIEW;
      // CHECK QUESTIONNAIRE
      const questionnaire = await assignment.getSubmissionQuestionnaire();
      // only progress if a valid quationnaire is made
      if (questionnaire && questionnaire.questions.length > 0) {
        checkQuestionnaire(questionnaire);
        reviews = await questionnaire.getReviews();
        if (reviews.length > 0) {
          state = AssignmentState.REVIEW;
          const reviewQuestionnaire = await assignment.getReviewQuestionnaire();
          if (assignment.reviewEvaluation && !reviewQuestionnaire) {
            // should never happen due to forced creation
            throw new Error("No evaluation while it is needed!");
          }
          if (
            assignment.reviewEvaluation &&
            !assignment.reviewQuestionnaireId
          ) {
            // should never happen due to forced creation
            throw new Error("No evaluationid while it is needed!");
          }
          state = AssignmentState.FEEDBACK;
          if (reviewQuestionnaire) {
            checkQuestionnaire(reviewQuestionnaire);
            reviewsof = await reviewQuestionnaire.getReviews();
            if (reviewsof.length === 0) {
              console.log("NO reviewsof made for assignment ", assignment.id);
            }
          }
        }
      }
    }
    // console.log(assignment.id);
    // if (
    //   state === AssignmentState.UNPUBLISHED ||
    //   state === AssignmentState.WAITING_FOR_REVIEW
    // ) {
    //   console.log(reviews.length, reviewsof.length);
    // }
    // if (state !== AssignmentState.FEEDBACK) {
    console.log(`C${assignment.courseId} : A${assignment.id} : ${state}`);
    // }
    assignment.state = state;
    // save value
    await assignment.save();
  }
  console.log("Done migration");
  return;
};

// migrateDBTest()
migrateDB()
  .then(() => {
    console.log("finished succesfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    console.log("did not finish succesfully");
    process.exit(1);
  });
