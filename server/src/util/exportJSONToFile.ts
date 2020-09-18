import exportFromJSON from "export-from-json";
import AssignmentExport from "../models/AssignmentExport";
import File from "../models/File";
import path from "path";
import config from "config";
import fsPromises from "fs/promises";
import { getManager } from "typeorm";
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
  const fileHash = null;
  const file = new File(fileName, fileExtension, fileHash);

  await getManager().transaction(
    process.env.NODE_ENV === "test" ? "SERIALIZABLE" : "READ COMMITTED",
    async (transactionalEntityManager) => {
      // save file entry to database
      await transactionalEntityManager.save(file);

      // add to assignmentExport
      assignmentExport.file = file;
      await transactionalEntityManager.save(assignmentExport);

      // write the file (so if this fails everything above fails)
      // new place where the file will be saved
      const filePath = path.resolve(uploadFolder, file.id.toString());
      // write
      await fsPromises.writeFile(filePath, fileBuffer);
    }
  );
};

export default exportJSONToFile;
