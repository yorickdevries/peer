import { ContainsKey } from "../util/seedData";
import ReviewQuestionnaire from "../models/ReviewQuestionnaire";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

async function createReviewQuestionnaire(
  override: ContainsKey<ReviewQuestionnaire>
): Promise<ReviewQuestionnaire> {
  return await new ReviewQuestionnaireFactory().create(override);
}

export { createReviewQuestionnaire };

export class ReviewQuestionnaireFactory extends Factory<ReviewQuestionnaire> {
  protected entity = ReviewQuestionnaire;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<ReviewQuestionnaire> {
    return new ReviewQuestionnaire();
  }
}
