import { define, factory } from "typeorm-seeding";
import Faker from "faker";
import { ContainsKey } from "../util/seedData";
import OpenQuestion from "../models/OpenQuestion";
import Questionnaire from "../models/Questionnaire";

async function createOpenQuestion(
  override: ContainsKey<OpenQuestion>
): Promise<OpenQuestion> {
  return await factory(OpenQuestion)().create(override);
}

define(OpenQuestion, (faker: typeof Faker) => {
  const text = faker.lorem.sentence();
  const number = faker.random.number({ min: 1, max: 10 });
  const optional = faker.random.boolean();
  const questionnaire = Object.create(Questionnaire);
  const maxWordCount = Number.MAX_SAFE_INTEGER;
  const minWordCount = 1;

  return new OpenQuestion(
    text,
    number,
    optional,
    questionnaire,
    maxWordCount,
    minWordCount
  );
});

export { createOpenQuestion };
