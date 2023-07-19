import { ContainsKey } from "../util/seedData";
import OpenQuestionAnswer from "../models/OpenQuestionAnswer";
import OpenQuestion from "../models/OpenQuestion";
import Review from "../models/Review";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { faker } from "@faker-js/faker";
import { dataSource } from "../databaseConnection";

async function createOpenQuestionAnswer(
  override: ContainsKey<OpenQuestionAnswer>
): Promise<OpenQuestionAnswer> {
  return await new OpenQuestionAnswerFactory().create(override);
}

export { createOpenQuestionAnswer };

export class OpenQuestionAnswerFactory extends Factory<OpenQuestionAnswer> {
  protected entity = OpenQuestionAnswer;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<OpenQuestionAnswer> {
    const question = Object.create(OpenQuestion);
    const review = Object.create(Review);
    const answer = faker.lorem.sentence();

    return new OpenQuestionAnswer().init({
      question: question,
      review: review,
      answer: answer,
    });
  }
}
