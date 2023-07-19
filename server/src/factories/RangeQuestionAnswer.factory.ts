import { ContainsKey } from "../util/seedData";
import Review from "../models/Review";
import RangeQuestionAnswer from "../models/RangeQuestionAnswer";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

async function createRangeQuestionAnswer(
  override: ContainsKey<RangeQuestionAnswer>
): Promise<RangeQuestionAnswer> {
  return await new RangeQuestionAnswerFactory().create(override);
}

export { createRangeQuestionAnswer };

export class RangeQuestionAnswerFactory extends Factory<RangeQuestionAnswer> {
  protected entity = RangeQuestionAnswer;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<RangeQuestionAnswer> {
    const question = Object.create(RangeQuestionAnswer);
    const review = Object.create(Review);
    const answer = 1;

    return new RangeQuestionAnswer().init({
      question: question,
      review: review,
      answer: answer,
    });
  }
}
