import { ContainsKey } from "../util/seedData";
import OpenQuestion from "../models/OpenQuestion";
import Questionnaire from "../models/Questionnaire";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { faker } from "@faker-js/faker";
import { dataSource } from "../databaseConnection";

async function createOpenQuestion(
  override: ContainsKey<OpenQuestion>
): Promise<OpenQuestion> {
  return await new OpenQuestionFactory().create(override);
}

export { createOpenQuestion };

export class OpenQuestionFactory extends Factory<OpenQuestion> {
  protected entity = OpenQuestion;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<OpenQuestion> {
    const text = faker.lorem.sentence();
    const number = faker.number.int({ min: 1, max: 10 });
    const optional = faker.datatype.boolean();
    const questionnaire = Object.create(Questionnaire);

    return new OpenQuestion().init({
      text: text,
      number: number,
      optional: optional,
      questionnaire: questionnaire,
    });
  }
}
