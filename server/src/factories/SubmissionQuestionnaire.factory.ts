import { define, factory } from "typeorm-seeding";
import { ContainsKey } from "../util/seedData";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";

async function createSubmissionQuestionnaire(
  override: ContainsKey<SubmissionQuestionnaire>
): Promise<SubmissionQuestionnaire> {
  return await factory(SubmissionQuestionnaire)().create(override);
}

define(SubmissionQuestionnaire, () => {
  return new SubmissionQuestionnaire();
});

export { createSubmissionQuestionnaire };
