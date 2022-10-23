import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import { ContainsKey } from "../util/seedData";
import Questionnaire from "../models/Questionnaire";
import RangeQuestion from "../models/RangeQuestion";

async function createRangeQuestion(
  override: ContainsKey<RangeQuestion>
): Promise<RangeQuestion> {
  return await factory(RangeQuestion)().create(override);
}

define(RangeQuestion, (faker: typeof Faker) => {
  const text = faker.lorem.sentence();
  const number = faker.random.number({ min: 1, max: 10 });
  const optional = faker.random.boolean();
  const questionnaire = Object.create(Questionnaire);
  const range = faker.random.number({ min: 1, max: 50 });

  return new RangeQuestion(text, number, optional, questionnaire, range);
});

export { createRangeQuestion };
