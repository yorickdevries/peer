import Submission from "../models/Submission";
import ensureConnection from "../util/ensureConnection";
//i import config from "config";
import fsPromises from "fs/promises";
import JSZip from "jszip";
import ServerFlagReason from "../enum/ServerFlagReason";

// const uploadFolder = config.get("uploadFolder") as string;

/**
 * Method to verify submission text
 * @param text Submision text to verify
 * @returns true if the text adheres to all rules and false otherwise
 */
const verifyTextContent = async function (text: string) {
  // A regular expression to only match non-whitespace characters.
  const nonWhiteSpace = /\S*/gu;
  return nonWhiteSpace.exec(text) !== null;
};

const loadZip = async function (fileBuffer: Buffer) {
  return JSZip.loadAsync(fileBuffer).then((zip) => {
    return Object.keys(zip.files)
      .map((name) => zip.file(name))
      .filter((f) => f) // filter out null files
      .filter((f) => !f?.dir);
  });
};

const submissionFlagging = async function (
  submissionId: number
): Promise<string> {
  await ensureConnection();

  const submission = await Submission.findOneOrFail(submissionId);

  const filePath = submission.file.getPath();
  const file = await fsPromises.readFile(filePath);
  let reason = "";
  const flag = await loadZip(file)
    .then(async (files) => {
      let flagged = false;
      for (const file of files) {
        flagged = (await file?.async("string").then(verifyTextContent)) ?? true;
      }
      if (flagged) reason = ServerFlagReason.EMPTY_FILES_IN_ZIP;
      return flagged;
    })
    .catch(async () => {
      // It's not a zip file, so try to read is as a single file with utf-8 encoding
      const flagged = await fsPromises
        .readFile(filePath, "utf8")
        .then(verifyTextContent);
      if (flagged) reason = ServerFlagReason.EMPTY;
      return flagged;
    });
  submission.flaggedByServer = flag;
  submission.commentByServer = reason;
  await submission.save();

  if (flag) {
    return `Flagged submission: ${submission.id} for reason : "${reason}"`;
  } else {
    return "";
  }
};

export default submissionFlagging;
