import { ContainsKey } from "../util/seedData";
import Questionnaire from "../models/Questionnaire";
import RangeQuestion from "../models/RangeQuestion";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { faker } from "@faker-js/faker";
import { dataSource } from "../databaseConnection";

async function createRangeQuestion(
  override: ContainsKey<RangeQuestion>
): Promise<RangeQuestion> {
  return await new RangeQuestionFactory().create(override);
}

export { createRangeQuestion };

export class RangeQuestionFactory extends Factory<RangeQuestion> {
  protected entity = RangeQuestion;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<RangeQuestion> {
    const text = faker.lorem.sentence();
    const number = faker.number.int({ min: 1, max: 10 });
    const optional = faker.datatype.boolean();
    const questionnaire = Object.create(Questionnaire);
    const range = faker.number.int({ min: 1, max: 50 });

    return new RangeQuestion().init({
      text: text,
      number: number,
      optional: optional,
      questionnaire: questionnaire,
      range: range,
    });
  }
}
