import { ContainsKey } from "../util/seedData";
import AssignmentVersion from "../models/AssignmentVersion";
import Assignment from "../models/Assignment";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { faker } from "@faker-js/faker";
import { dataSource } from "../databaseConnection";

async function createAssignmentVersion(
  override: ContainsKey<AssignmentVersion>
): Promise<AssignmentVersion> {
  return new AssignmentVersionFactory().create(override);
}

export { createAssignmentVersion };

export class AssignmentVersionFactory extends Factory<AssignmentVersion> {
  protected entity = AssignmentVersion;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<AssignmentVersion> {
    const name = faker.commerce.product();
    const assignment = Object.create(Assignment);
    const versionsToReview: AssignmentVersion[] = [];
    const versionsPerUser = 1;
    const selfReview = false;
    const submissionQuestionnaire = null;
    const reviewQuestionnaire = null;

    return new AssignmentVersion().init({
      name: name,
      assignment: assignment,
      versionsToReview: versionsToReview,
      reviewsPerUserPerAssignmentVersionToReview: versionsPerUser,
      selfReview: selfReview,
      submissionQuestionnaire: submissionQuestionnaire,
      reviewQuestionnaire: reviewQuestionnaire,
    });
  }
}
