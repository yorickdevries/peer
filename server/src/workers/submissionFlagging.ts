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

/**
 * Method to load a zip file
 * @param filePath The file path to load as zip file
 * @returns An object with all the files if it was loaded, and an error otherwise
 */
const loadZip = async function (filePath: string) {
  const file = await fsPromises.readFile(filePath);

  return JSZip.loadAsync(file).then((zip) => {
    return Object.keys(zip.files)
      .map((name) => zip.file(name))
      .filter((f) => f) // filter out null files
      .filter((f) => !f?.dir); // filter out all files that are directories
  });
};

/**
 * Method to load a file that's not a zip archive
 * @param filePath The file path to load
 * @returns An object with all the files if it was loaded, and an error otherwise
 */
const loadFile = async function (filePath: string): Promise<string> {
  return fsPromises.readFile(filePath, "utf8");
};

/**
 *
 * @param submissionId The submission id to check for irregularities
 * @returns `Flagged submission ${submission.id} for reason : "${reason}"` if any irregularity was found. `Submission ${submission.id} is okay.` if it was okay.
 */
const submissionFlagging = async function (
  submissionId: number
): Promise<string> {
  await ensureConnection();

  const submission = await Submission.findOneOrFail(submissionId);

  const filePath = submission.file.getPath();
  const fileExtension = submission.file.extension;

  let reason = "";

  let flag: boolean;

  if (fileExtension === "zip") {
    flag = await loadZip(filePath)
      .then(async (files) => {
        let flagged = false;

        // If there are no files in this zip archive, i.e. it's empty
        if (Object.keys(files).length === 0) {
          flagged = true;
          reason = ServerFlagReason.EMPTY;
          return flagged;
        } else {
          for (const file of files) {
            flagged =
              !flagged &&
              !(await file?.async("string").then(verifyTextContent)); // To make sure the flag remains true if we have already encountered a suspicious file
          }
          if (flagged) reason = ServerFlagReason.EMPTY_FILES_IN_ZIP;
          return flagged;
        }
      })
      .catch(async () => {
        // The zip file is corrupted, so just say it's corrupted
        reason = ServerFlagReason.CORRUPTED_ZIP;
        return true;
      });
  } else {
    flag = !(await loadFile(filePath).then(verifyTextContent));
    reason = ServerFlagReason.EMPTY;
  }

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
