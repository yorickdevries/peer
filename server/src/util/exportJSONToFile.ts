import exportFromJSON from "export-from-json";
import { parse as json2csvParser } from "json2csv";
import { Response } from "express";
import HttpStatusCode from "../enum/HttpStatusCode";
import _ from "lodash";

// Method to export data to an export with the indicated fileName to the res object
const exportJSONToFile = function (
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: object[],
  fileName: string,
  exportType: "xls" | "csv",
  res: Response
) {
  // Check if the export data contains data.
  if (data.length == 0) {
    res.status(HttpStatusCode.BAD_REQUEST);
    res.send("Nothing to export.");
    return;
  }
  // based on the exporttype, choose the right function
  if (exportType === "xls") {
    exportJSONToXLSFile(data, fileName, res);
  } else if (exportType === "csv") {
    exportJSONToCSVFile(data, fileName, res);
  } else {
    throw new Error("Invalid exportType");
  }
};

// Exports to XLS.
const exportJSONToXLSFile = function (
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: object[],
  fileName: string,
  res: Response
) {
  const result = exportFromJSON({
    data,
    fileName,
    exportType: "xls",
    processor(content, _type, fileName) {
      res.setHeader("Content-Type", "application/vnd.ms-excel");
      res.setHeader("Content-disposition", "attachment;filename=" + fileName);
      return content;
    },
  });
  res.write(result);
  res.end();
};

// Exports to CSV.
const exportJSONToCSVFile = function (
  // eslint-disable-next-line @typescript-eslint/ban-types
  data: object[],
  fileName: string,
  res: Response
) {
  // Get the fields for the csv file. Export data contains at least 1 item at this point.
  const csvFields = _.union(
    _.flatMap(data, (element) => {
      return _.keys(element);
    })
  );

  res.setHeader("Content-disposition", `attachment; filename=${fileName}.csv`);
  res.set("Content-Type", "text/csv");
  res.send(json2csvParser(data, { fields: csvFields }));
};

export default exportJSONToFile;
