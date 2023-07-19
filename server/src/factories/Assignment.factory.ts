import { ContainsKey } from "../util/seedData";
import Assignment from "../models/Assignment";
import Course from "../models/Course";
import moment from "moment";
import AssignmentType from "../enum/AssignmentType";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";
import { faker } from "@faker-js/faker";

async function createAssignment(
  override: ContainsKey<Assignment>
): Promise<Assignment> {
  return new AssignmentFactory().create(override);
}

export { createAssignment };

export class AssignmentFactory extends Factory<Assignment> {
  protected entity = Assignment;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<Assignment> {
    const assignmentName = faker.commerce.productName();
    const course = Object.create(Course);
    const enrollable = true;
    const reviewEvaluation = true;
    const publishDate = moment().add().toDate();
    const dueDate = moment().add(1, "days").toDate();
    const reviewPublishDate = moment().add(2, "days").toDate();
    const reviewDueDate = moment().add(3, "days").toDate();
    const reviewEvaluationDueDate = reviewEvaluation
      ? moment().add(4, "days").toDate()
      : null;
    const description = faker.lorem.sentence();
    const file = null;
    const externalLink = faker.datatype.boolean() ? faker.image.url() : null;
    const submissionExtensions = faker.helpers.arrayElement([
      ".pdf",
      ".docx",
      ".txt",
      ".md",
    ]);
    const blockFeedback = true;
    const lateSubmissions = true;
    const lateSubmissionReviews = true;
    const lateReviewEvaluations = true;
    const automaticStateProgression = false;
    const assignmentType = AssignmentType.DOCUMENT;
    const sendNotificationEmails = true;

    return new Assignment().init({
      name: assignmentName,
      course: course,
      enrollable: enrollable,
      reviewEvaluation: reviewEvaluation,
      publishDate: publishDate,
      dueDate: dueDate,
      reviewPublishDate: reviewPublishDate,
      reviewDueDate: reviewDueDate,
      reviewEvaluationDueDate: reviewEvaluationDueDate,
      description: description,
      file: file,
      externalLink: externalLink,
      submissionExtensions: submissionExtensions,
      blockFeedback: blockFeedback,
      lateSubmissions: lateSubmissions,
      lateSubmissionReviews: lateSubmissionReviews,
      lateReviewEvaluations: lateReviewEvaluations,
      automaticStateProgression: automaticStateProgression,
      assignmentType: assignmentType,
      sendNotifcationEmails: sendNotificationEmails,
    });
  }
}
