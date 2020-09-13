import _ from "lodash";
import createDatabaseConnection from "./databaseConnection";
import { AssignmentState } from "./enum/AssignmentState";
import Assignment from "./models/Assignment";
import Group from "./models/Group";
import ReviewOfSubmission from "./models/ReviewOfSubmission";
import Submission from "./models/Submission";

const migrateDB = async function (): Promise<void> {
  console.log("Start migration");

  // database connection with mysql database
  const connection = await createDatabaseConnection();
  console.log(connection.name);

  let submissionCounter = 0;
  let latestSubmissionCounter = 0;
  let groupWithoutSubmissionCounter = 0;

  const assignments = await Assignment.find();
  console.log("total assignments: ", assignments.length);
  for (const assignment of assignments) {
    let assignmentGroupWithoutSubmissionCounter = 0;
    console.log("assignment", assignment.id);
    const groups = await assignment.getGroups();
    for (const group of groups) {
      const submissions = await assignment.getSubmissions(group);
      submissionCounter += submissions.length;
      const latestSubmission = _.maxBy(submissions, "id");
      if (latestSubmission) {
        latestSubmission.final = true;
        await latestSubmission.save();
        latestSubmissionCounter += 1;
      } else {
        //console.log("No submissions found for group: ", group.id);
        assignmentGroupWithoutSubmissionCounter += 1;
      }
    }
    if (
      assignmentGroupWithoutSubmissionCounter === groups.length &&
      !(
        assignment.state === AssignmentState.UNPUBLISHED ||
        assignment.state === AssignmentState.SUBMISSION
      )
    ) {
      throw new Error("no submisisons made for assignment " + assignment.id);
    }
    if (
      assignmentGroupWithoutSubmissionCounter !== groups.length &&
      assignment.state === AssignmentState.UNPUBLISHED
    ) {
      throw new Error("submisisons made for assignment " + assignment.id);
    }
    console.log(
      `${groups.length - assignmentGroupWithoutSubmissionCounter} out of ${
        groups.length
      } groups have made a submission\n`
    );
    groupWithoutSubmissionCounter += assignmentGroupWithoutSubmissionCounter;
  }

  console.log("Performing sanity checks");

  // sanity check:
  const reviewsOfSubmissions = await ReviewOfSubmission.find();
  console.log("total reviews: ", reviewsOfSubmissions.length);
  // iterate over reviews
  for (const reviewsOfSubmission of reviewsOfSubmissions) {
    const submission = reviewsOfSubmission.submission;
    if (submission) {
      if (!submission.final) {
        throw new Error("submission is not final");
      }
    } else {
      throw new Error("submission undefined");
    }
  }

  const submissions = await Submission.find();
  console.log("total submissions: ", submissions.length);

  for (const submission of submissions) {
    const assignment = await submission.getAssignment();
    const reviews = await submission.getReviewOfSubmissions();
    if (!submission.final) {
      if (reviews.length > 0) {
        throw new Error("submission is not final but has reviews");
      }
    } else {
      if (
        assignment.state === AssignmentState.UNPUBLISHED ||
        assignment.state === AssignmentState.SUBMISSION ||
        assignment.state === AssignmentState.WAITING_FOR_REVIEW
      ) {
        if (reviews.length > 0) {
          throw new Error("reviews present while in the wrong state");
        }
      } else {
        if (reviews.length === 0) {
          throw new Error("no reviews present while in review or feedback");
        }
      }
    }
  }

  const groups = await Group.find();
  console.log("total groups: ", groups.length);

  console.log("total submission counter: ", submissionCounter);
  console.log("latest submission counter: ", latestSubmissionCounter);
  console.log(
    "groupWithoutSubmission counter: ",
    groupWithoutSubmissionCounter
  );

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
    process.exit(1);
  });
