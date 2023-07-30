import { define, factory } from "typeorm-seeding";
import { ContainsKey } from "../util/seedData";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";

async function createReviewQuestionnaire(
  override: ContainsKey<ReviewQuestionnaire>
): Promise<ReviewQuestionnaire> {
  return await factory(ReviewQuestionnaire)().create(override);
}

define(ReviewQuestionnaire, () => {
  return new ReviewQuestionnaire();
});

export { createReviewQuestionnaire };
