import createDatabaseConnection from "../databaseConnection";
import moment from "moment";
import Assignment from "../models/Assignment";

const checkAssignments = async function () {
  const assignments = await Assignment.find();
  let counter = 0;
  for (const assignment of assignments) {
    try {
      await assignment.validateOrReject();
    } catch (_) {
      counter++;
    }
  }
  console.log(counter);
};

const fixAssignmentTimes = async function () {
  await checkAssignments();
  const assignments = await Assignment.find();
  for (const assignment of assignments) {
    let counter = 0;
    // fix duedate
    while (
      moment(assignment.publishDate)
        .add(15, "minutes")
        .isAfter(assignment.dueDate)
    ) {
      // add a minute
      assignment.dueDate = moment(assignment.dueDate)
        .add(1, "minutes")
        .toDate();
      counter++;
    }

    // fix reviewpublishdate
    while (
      moment(assignment.dueDate)
        .add(15, "minutes")
        .isAfter(assignment.reviewPublishDate)
    ) {
      // add a minute
      assignment.reviewPublishDate = moment(assignment.reviewPublishDate)
        .add(1, "minutes")
        .toDate();
      counter++;
    }

    // fix reviewduedate
    while (
      moment(assignment.reviewPublishDate)
        .add(15, "minutes")
        .isAfter(assignment.reviewDueDate)
    ) {
      // add a minute
      assignment.reviewDueDate = moment(assignment.reviewDueDate)
        .add(1, "minutes")
        .toDate();
      counter++;
    }

    if (assignment.reviewEvaluation) {
      // fix reviewevaluationduedate
      while (
        moment(assignment.reviewDueDate)
          .add(15, "minutes")
          .isAfter(assignment.reviewEvaluationDueDate)
      ) {
        // add a minute
        assignment.reviewEvaluationDueDate = moment(
          assignment.reviewEvaluationDueDate
        )
          .add(1, "minutes")
          .toDate();
        counter++;
      }
    }
    console.log(`A: ${assignment.id}, min: ${counter}`);
    await assignment.save();
  }
  await checkAssignments();
};

createDatabaseConnection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .then((_connection) => {
    fixAssignmentTimes()
      .then(() => {
        console.log("Done");
        process.exit(0);
      })
      .catch((error) => {
        console.error(error);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
