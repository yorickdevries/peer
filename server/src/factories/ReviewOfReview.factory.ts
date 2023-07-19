import { ContainsKey } from "../util/seedData";
import Review from "../models/Review";
import ReviewOfReview from "../models/ReviewOfReview";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import User from "../models/User";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

async function createReviewOfReview(
  override: ContainsKey<ReviewOfReview>
): Promise<ReviewOfReview> {
  return await new ReviewOfReviewFactory().create(override);
}

export { createReviewOfReview };

export class ReviewOfReviewFactory extends Factory<ReviewOfReview> {
  protected entity = ReviewOfReview;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<ReviewOfReview> {
    const reviewQuestionnaire = Object.create(ReviewQuestionnaire);
    const user = Object.create(User);
    const review = Object.create(Review);

    return new ReviewOfReview().init({
      questionnaire: reviewQuestionnaire,
      user: user,
      flaggedByReviewer: false,
      submitted: false,
      startedAt: new Date(), // set startedAt
      downloadedAt: null,
      submittedAt: null,
      reviewOfSubmission: review,
    });
  }
}
