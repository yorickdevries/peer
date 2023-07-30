import { define, factory } from "typeorm-seeding";
import { ContainsKey } from "../util/seedData";
import Faker from "faker";
import OpenQuestionAnswer from "../models/OpenQuestionAnswer";
import OpenQuestion from "../models/OpenQuestion";
import Review from "../models/Review";

async function createOpenQuestionAnswer(
  override: ContainsKey<OpenQuestionAnswer>
): Promise<OpenQuestionAnswer> {
  return await factory(OpenQuestionAnswer)().create(override);
}

define(OpenQuestionAnswer, (faker: typeof Faker) => {
  const question: OpenQuestion = Object.create(OpenQuestion);
  const review = Object.create(Review);
  const answer = faker.lorem.sentence().substring(0, question.maxWordCount);

  return new OpenQuestionAnswer(question, review, answer);
});

export { createOpenQuestionAnswer };
