import _ from "lodash";
import createDatabaseConnection from "../databaseConnection";
import Assignment from "../models/Assignment";
import AssignmentVersion from "../models/AssignmentVersion";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import Submission from "../models/Submission";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";

const printHello = async function () {
  await createDatabaseConnection();
  const assignments = _.sortBy(await Assignment.find(), "id");

  let submissionCounter = 0;

  for (const assignment of assignments) {
    console.log(assignment.id);
    let submissionQuestionnaire = null;
    if (assignment.submissionQuestionnaireId) {
      submissionQuestionnaire = await SubmissionQuestionnaire.findOneOrFail(
        assignment.submissionQuestionnaireId
      );
    }
    let reviewQuestionnaire = null;
    if (assignment.reviewQuestionnaireId) {
      reviewQuestionnaire = await ReviewQuestionnaire.findOneOrFail(
        assignment.reviewQuestionnaireId
      );
    }
    const assignmentVersion = new AssignmentVersion(
      "default",
      assignment,
      [],
      assignment.reviewsPerUser,
      false,
      submissionQuestionnaire,
      reviewQuestionnaire
    );
    await assignmentVersion.save();
    assignmentVersion.versionsToReview = [assignmentVersion];
    await assignmentVersion.save();

    const submissions = await Submission.find({
      where: { assignment: assignment },
    });
    submissionCounter += submissions.length;
    for (const submission of submissions) {
      submission.assignmentVersion = assignmentVersion;
      await submission.save();
    }
  }
  console.log(`Total submissions: ${submissionCounter}`);
  return;
};

printHello()
  .then(() => {
    console.log("done");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
