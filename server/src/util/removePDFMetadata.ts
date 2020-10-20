import exiftool from "node-exiftool";
import exiftoolBin from "dist-exiftool";

const removePDFMetadata = async function (filePath: string): Promise<void> {
  const ep = new exiftool.ExiftoolProcess(exiftoolBin);
  await ep.open();
  await ep
    .writeMetadata(filePath, { all: "" }, ["overwrite_original"])
    .then((data: unknown) => {
      console.log("log: ", data);
    })
    .catch((data: unknown) => {
      console.log("error: ", data);
    });
  await ep.close();
};

export default removePDFMetadata;
