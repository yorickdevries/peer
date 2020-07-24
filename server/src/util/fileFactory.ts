import path from "path";
import hasha from "hasha";
import File from "../models/File";

const constructFile = function (
  fileBuffer: Buffer,
  fileNamewithExtension: string
): File {
  // file info
  const fileExtension = path.extname(fileNamewithExtension);
  const fileName = path.basename(fileNamewithExtension, fileExtension);
  const fileHash = hasha(fileBuffer, { algorithm: "sha256" });
  const file = new File(fileName, fileExtension, fileHash);
  return file;
};

export default constructFile;
