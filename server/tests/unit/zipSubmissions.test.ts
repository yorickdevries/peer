import AssignmentExport from "../../src/models/AssignmentExport";
import Submission from "../../src/models/Submission";
import { mock, instance } from "ts-mockito";
import exportToZip from "../../src/util/exportZip";
import path from "path";
import File from "../../src/models/File";
import fs from "fs";
import JSZip from "jszip";

describe("Zip Submission Test", () => {
  let mockedAssignmentExport: AssignmentExport;
  let instanceOfAssignmentExport: AssignmentExport;
  let s1: Submission;
  let s2: Submission;
  let instanceOfS1: Submission;
  let instanceOfS2: Submission;
  let listOfSubmissions: Submission[];
  //let filePath:string = path.join(__dirname, "../testFiles", "submission1.pdf");
  const zipFileName = "zippedSubmissions";
  test("Single submission", async () => {
    const pdfFile = new File(
      "submission",
      ".pdf",
      null,
      path.join(__dirname, "../testFiles", "submission1.pdf")
    );
    mockedAssignmentExport = mock(AssignmentExport);
    instanceOfAssignmentExport = instance(mockedAssignmentExport);
    s1 = mock(Submission);
    s2 = mock(Submission);
    instanceOfS2 = instance(s2);
    instanceOfS1 = instance(s1);
    instanceOfS2.userNetid = "user2";
    instanceOfS1.userNetid = "user1";
    instanceOfS2.file = pdfFile;
    instanceOfS1.file = pdfFile;
    listOfSubmissions = [instanceOfS1, instanceOfS2];
    await exportToZip(
      instanceOfAssignmentExport,
      listOfSubmissions,
      zipFileName
    );

    const zipFilePath = "zippedSubmissions.zip";
    let files: any[] = [];
    // read a zip file
    await fs.readFile(zipFilePath, (err: any, data: any) => {
      if (err) throw err;
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      JSZip.loadAsync(data).then((zip: any) => {
        files = Object.keys(zip.files);
        expect(files).toBe(["pdfs/", "pdfs/user1.pdf", "pdfs/user2.pdf"]);
      });
    });
  });
});
