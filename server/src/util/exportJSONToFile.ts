import exportFromJSON from "export-from-json";
import { Response } from "express";
import HttpStatusCode from "../enum/HttpStatusCode";

// Method to export data to an export with the indicated fileName to the res object
const exportJSONToFile = function (
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: object[],
  fileName: string,
  exportType: "xls" | "csv",
  res: Response
): void {
  // Check if the export data contains data.
  if (data.length == 0) {
    res.status(HttpStatusCode.BAD_REQUEST);
    res.send("Nothing to export.");
    return;
  }
  const result = exportFromJSON({
    data,
    fileName,
    exportType,
    processor(content, type, fileName) {
      switch (type) {
        case "csv":
          res.setHeader("Content-Type", "text/csv");
          break;
        case "xls":
          res.setHeader("Content-Type", "application/vnd.ms-excel");
          break;
      }
      res.setHeader("Content-disposition", "attachment;filename=" + fileName);
      return content;
    },
  });
  res.write(result);
  res.end();
};

export default exportJSONToFile;
