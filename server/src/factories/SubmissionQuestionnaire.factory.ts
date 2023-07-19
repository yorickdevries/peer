import { ContainsKey } from "../util/seedData";
import SubmissionQuestionnaire from "../models/SubmissionQuestionnaire";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

async function createSubmissionQuestionnaire(
  override: ContainsKey<SubmissionQuestionnaire>
): Promise<SubmissionQuestionnaire> {
  return await new SubmissionQuestionnaireFactory().create(override);
}

export { createSubmissionQuestionnaire };

export class SubmissionQuestionnaireFactory extends Factory<SubmissionQuestionnaire> {
  protected entity = SubmissionQuestionnaire;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<SubmissionQuestionnaire> {
    return new SubmissionQuestionnaire();
  }
}
