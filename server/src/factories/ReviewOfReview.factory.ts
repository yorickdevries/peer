import { define, factory } from "typeorm-seeding";
import { ContainsKey } from "../util/seedData";
import Review from "../models/Review";
import ReviewOfReview from "../models/ReviewOfReview";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import User from "../models/User";

async function createReviewOfReview(
  override: ContainsKey<ReviewOfReview>
): Promise<ReviewOfReview> {
  return await factory(ReviewOfReview)().create(override);
}

define(ReviewOfReview, () => {
  const reviewQuestionnaire = Object.create(ReviewQuestionnaire);
  const user = Object.create(User);
  const review = Object.create(Review);

  return new ReviewOfReview(
    reviewQuestionnaire,
    user,
    false,
    false,
    new Date(), // set startedAt
    null,
    null,
    review
  );
});

export { createReviewOfReview };
