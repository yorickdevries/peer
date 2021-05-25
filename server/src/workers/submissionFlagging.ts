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
  const nonWhiteSpace = /\S+/gm;
  return nonWhiteSpace.exec(text) !== null; // If we find non-whitespace characters, this file is probably not empty
};

const loadZip = async function (fileBuffer: Buffer) {
  return JSZip.loadAsync(fileBuffer).then((zip) => {
    return Object.keys(zip.files)
      .map((name) => zip.file(name))
      .filter((f) => f) // filter out null files
      .filter((f) => !f!.dir); // filter out all files that are directories
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
        flagged = !(await file!.async("string").then(verifyTextContent));
      }
      if (flagged) reason = ServerFlagReason.EMPTY_FILES_IN_ZIP;
      return flagged;
    })
    .catch(async (err: Error) => {
      let flagged: boolean;
      if (err.message.includes("Corrupted")) {// The zip file is corrupted, so just say it's corrupted
        reason = ServerFlagReason.CORRUPTED_ZIP;
        flagged = true;
      } else {// It's probably not a zip file, so try to read is as a single file with utf-8 encoding
        flagged = !(await fsPromises
          .readFile(filePath, "utf8")
          .then(verifyTextContent));
        if (flagged) reason = ServerFlagReason.EMPTY;
      }
      return flagged;
    });
  submission.flaggedByServer = flag;

  submission.commentByServer = flag ? reason : null;

  await submission.save();

  if (flag) {
    return `Flagged submission ${submission.id} for reason : "${reason}"`;
  } else {
    return `Submission ${submission.id} is okay.`;
  }
};

export default submissionFlagging;
