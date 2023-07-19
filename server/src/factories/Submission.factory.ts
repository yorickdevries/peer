import { ContainsKey } from "../util/seedData";
import User from "../models/User";
import Submission from "../models/Submission";
import Group from "../models/Group";
import AssignmentVersion from "../models/AssignmentVersion";
import File from "../models/File";
import { FactorizedAttrs, Factory } from "@jorgebodega/typeorm-factory";
import { dataSource } from "../databaseConnection";

async function createSubmission(
  override: ContainsKey<Submission>
): Promise<Submission> {
  return await new SubmissionFactory().create(override);
}

export { createSubmission };

export class SubmissionFactory extends Factory<Submission> {
  protected entity = Submission;
  protected dataSource = dataSource;
  protected attrs(): FactorizedAttrs<Submission> {
    const user = Object.create(User);
    const group = Object.create(Group);
    const assignmentVersion = Object.create(AssignmentVersion);
    const file = Object.create(File);
    const final = true;

    return new Submission().init({
      user: user,
      group: group,
      assignmentVersion: assignmentVersion,
      file: file,
      final: final,
    });
  }
}
