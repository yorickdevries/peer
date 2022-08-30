import AssignmentExport from "../models/AssignmentExport";
import File from "../models/File";
import path from "path";
import { getManager } from "typeorm";
import Submission from "../models/Submission";

const exportToZip = async function (
  assignmentExport: AssignmentExport,
  sortedSubmissions: Submission[]
): Promise<void> {
  /* eslint-disable */
    const JSZip = require("jszip");
    /* eslint-disable */
    const fs = require("fs");
    //create file object
    const zip = new JSZip();
    const pdfs = zip.folder("pdfs");
    for (let i = 0; i < sortedSubmissions.length; i++) {
      const filePath = sortedSubmissions[i].file.getPath();
      //add student number to title instead of just 1,2,3...
      const fileName = `${sortedSubmissions[i].file.id}`;
      if(pdfs) {
        pdfs.file(fileName, fs.readFileSync(filePath), { base64: true });
      }
    }

    const content = await zip.generateAsync({ type: "nodebuffer" });
    fs.writeFileSync("example.zip", content);
    const file = new File("example", ".zip", null, path.join(__dirname, '../../', 'example.zip'));
    await getManager().transaction(
        "READ COMMITTED",
        async (transactionalEntityManager) => {
          // save file entry to database
          await file.validateOrReject();
          await transactionalEntityManager.save(file);
    
          // add to assignmentExport
          assignmentExport.file = file;
          await assignmentExport.validateOrReject();
          await transactionalEntityManager.save(assignmentExport);
        }
      );
}


export default exportToZip;
