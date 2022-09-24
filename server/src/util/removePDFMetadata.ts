import exiftool from "node-exiftool";
import exiftoolBin from "dist-exiftool";

const removePDFMetadata = async function (filePath: string): Promise<void> {
  const ep = new exiftool.ExiftoolProcess(exiftoolBin);
  await ep.open();
  await ep.writeMetadata(filePath, { all: "" }, ["overwrite_original"]);
  await ep.close();
};

export default removePDFMetadata;
