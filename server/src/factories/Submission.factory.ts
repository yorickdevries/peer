import { define, factory } from "typeorm-seeding";
import { ContainsKey } from "../util/seedData";
import User from "../models/User";
import Submission from "../models/Submission";
import Group from "../models/Group";
import AssignmentVersion from "../models/AssignmentVersion";
import File from "../models/File";

async function createSubmission(
  override: ContainsKey<Submission>
): Promise<Submission> {
  return await factory(Submission)().create(override);
}

define(Submission, () => {
  const user = Object.create(User);
  const group = Object.create(Group);
  const assignmentVersion = Object.create(AssignmentVersion);
  const file = Object.create(File);
  const final = true;

  return new Submission(user, group, assignmentVersion, file, final);
});

export { createSubmission };
