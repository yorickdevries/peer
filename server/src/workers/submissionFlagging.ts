import Submission from "../models/Submission";
import ensureConnection from "../util/ensureConnection";
//i import config from "config";
import fsPromises from "fs/promises";

// const uploadFolder = config.get("uploadFolder") as string;

const submissionFlagging = async function (
  submissionId: number
): Promise<string> {
  await ensureConnection();

  const submission = await Submission.findOneOrFail(submissionId);

  const filePath = submission.file.getPath();
  await fsPromises.readFile(filePath).then((_contents) => {
    console.log("Found file contents");
  });

  return `Flagged file: ${submission.file.getFileNamewithExtension()}`;
};

export default submissionFlagging;
