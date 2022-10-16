import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import { ContainsKey } from "../util/seedData";
import Assignment from "../models/Assignment";
import Course from "../models/Course";
import moment from "moment";
import AssignmentType from "../enum/AssignmentType";

async function createAssignment(
  override: ContainsKey<Assignment>
): Promise<Assignment> {
  return await factory(Assignment)().create(override);
}

define(Assignment, (faker: typeof Faker) => {
  const assignmentName = faker.commerce.productName();
  const course = Object.create(Course);
  const enrollable = true;
  const reviewEvaluation = faker.random.boolean();
  const publishDate = moment().add().toDate();
  const dueDate = moment().add(1, "days").toDate();
  const reviewPublishDate = moment().add(2, "days").toDate();
  const reviewDueDate = moment().add(3, "days").toDate();
  const reviewEvaluationDueDate = reviewEvaluation
    ? moment().add(4, "days").toDate()
    : null;
  const description = faker.lorem.sentence();
  const file = null;
  const externalLink = faker.random.boolean() ? faker.image.animals() : null;
  const submissionExtensions = faker.helpers.randomize([
    ".pdf",
    ".docx",
    ".txt",
    ".md",
  ]);
  const blockFeedback = faker.random.boolean();
  const lateSubmissions = faker.random.boolean();
  const lateSubmissionReviews = faker.random.boolean();
  const lateReviewEvaluations = faker.random.boolean();
  const automaticStateProgression = false;
  const assignmentType = AssignmentType.DOCUMENT;

  return new Assignment(
    assignmentName,
    course,
    enrollable,
    reviewEvaluation,
    publishDate,
    dueDate,
    reviewPublishDate,
    reviewDueDate,
    reviewEvaluationDueDate,
    description,
    file,
    externalLink,
    submissionExtensions,
    blockFeedback,
    lateSubmissions,
    lateSubmissionReviews,
    lateReviewEvaluations,
    automaticStateProgression,
    assignmentType
  );
});

export { createAssignment };
