import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import { ContainsKey } from "../util/seedData";
import AssignmentVersion from "../models/AssignmentVersion";
import Assignment from "../models/Assignment";

async function createAssignmentVersion(
  override: ContainsKey<AssignmentVersion>
): Promise<AssignmentVersion> {
  return await factory(AssignmentVersion)().create(override);
}

define(AssignmentVersion, (faker: typeof Faker) => {
  const name = faker.commerce.product();
  const assignment = Object.create(Assignment);
  const versionsToReview: AssignmentVersion[] = [];
  const versionsPerUser = 1;
  const selfReview = false;
  const submissionQuestionnaire = null;
  const reviewQuestionnaire = null;

  return new AssignmentVersion(
    name,
    assignment,
    versionsToReview,
    versionsPerUser,
    selfReview,
    submissionQuestionnaire,
    reviewQuestionnaire
  );
});

export { createAssignmentVersion };
