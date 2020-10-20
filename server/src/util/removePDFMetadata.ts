import exiftool from "node-exiftool";
import exiftoolBin from "dist-exiftool";
import fs from "fs"; //Load the filesystem module

const removePDFMetadata = async function (filePath: string): Promise<void> {
  const statsBefore = JSON.stringify(fs.statSync(filePath));
  const ep = new exiftool.ExiftoolProcess(exiftoolBin);
  await ep.open();
  await ep.writeMetadata(filePath, { all: "" }, ["overwrite_original"]);
  await ep.close();
  const statsAfter = JSON.stringify(fs.statSync(filePath));
  // log stats for debugging
  console.log(`Before:\n${statsBefore}\nAfter\n${statsAfter}`);
};

export default removePDFMetadata;
