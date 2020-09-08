import exportFromJSON from "export-from-json";
import AssignmentExport from "../models/AssignmentExport";
import File from "../models/File";
import path from "path";
import config from "config";
// import hasha from "hasha";
import fsPromises from "fs/promises";
const uploadFolder = config.get("uploadFolder") as string;

// Method to export data to an export with the indicated fileName to the res object
const exportJSONToFile = async function (
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: object[],
  fileName: string,
  exportType: "xls" | "csv",
  assignmentExport: AssignmentExport
): Promise<void> {
  const result = exportFromJSON({
    data,
    fileName,
    exportType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    processor(content, _type, _fileName) {
      return content;
    },
  });

  // create the file object
  const fileBuffer = Buffer.from(result);
  const fileExtension = `.${exportType}`;
  const fileHash =
    "0000000000000000000000000000000000000000000000000000000000000000";
  const file = new File(fileName, fileExtension, fileHash);
  await file.save();

  // save the file to disk lastly
  // (if this goes wrong all previous steps are rolled back)
  const filePath = path.resolve(uploadFolder, file.id.toString());
  await fsPromises.writeFile(filePath, fileBuffer);

  // add to assignmentExport
  assignmentExport.file = file;
  // this checks for the right extension in the validate function
  await assignmentExport.save();
};

export default exportJSONToFile;
