import { define, factory } from "typeorm-seeding";
import { ContainsKey } from "../util/seedData";
import User from "../models/User";
import Submission from "../models/Submission";
import Group from "../models/Group";
import AssignmentVersion from "../models/AssignmentVersion";
import File from "../models/File";
import Faker from "faker";
import OpenQuestionAnswer from "../models/OpenQuestionAnswer";

async function createOpenQuestionAnswer(
  override: ContainsKey<OpenQuestionAnswer>
): Promise<OpenQuestionAnswer> {
  return await factory(OpenQuestionAnswer)().create(override);
}

define(OpenQuestionAnswer, (faker: typeof Faker) => {
  const user = Object.create(User);
  const group = Object.create(Group);
  const assignmentVersion = Object.create(AssignmentVersion);
  const file = Object.create(File);
  const final = true;

  return new OpenQuestionAnswer(user, group, assignmentVersion, file, final);
});

export { createOpenQuestionAnswer };
