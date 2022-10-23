import { define, factory } from "typeorm-seeding";
import { ContainsKey } from "../util/seedData";
import Review from "../models/Review";
import RangeQuestionAnswer from "../models/RangeQuestionAnswer";

async function createRangeQuestionAnswer(
  override: ContainsKey<RangeQuestionAnswer>
): Promise<RangeQuestionAnswer> {
  return await factory(RangeQuestionAnswer)().create(override);
}

define(RangeQuestionAnswer, () => {
  const question = Object.create(RangeQuestionAnswer);
  const review = Object.create(Review);
  const answer = 1;

  return new RangeQuestionAnswer(question, review, answer);
});

export { createRangeQuestionAnswer };
