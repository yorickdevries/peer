import path from "path";
import hasha from "hasha";
import fsPromises from "fs/promises";
import File from "../models/File";
import config from "config";

const uploadFolder = config.get("uploadFolder") as string;

const databaseFile = async function (
  fileBuffer: Buffer,
  fileNamewithExtension: string
): Promise<File> {
  // file info
  const fileExtension = path.extname(fileNamewithExtension);
  let fileName = path.basename(fileNamewithExtension, fileExtension);
  // check if the filename starts with timestamp
  const timest = parseInt(fileName.substring(0, 13));
  if (
    timest > 1500000000000 &&
    timest < 1600000000000 &&
    fileName.substring(13, 14) === "-"
  ) {
    fileName = fileName.substring(14);
  }
  const fileHash = hasha(fileBuffer, { algorithm: "sha256" });
  const file = new File(fileName, fileExtension, fileHash);
  await file.save();
  return file;
};

const constructFile = async function (
  fileBuffer: Buffer,
  fileNamewithExtension: string
): Promise<File> {
  const file = await databaseFile(fileBuffer, fileNamewithExtension);
  const filePath = path.resolve(uploadFolder, file.id.toString());
  await fsPromises.writeFile(filePath, fileBuffer);
  return file;
};

export default constructFile;
