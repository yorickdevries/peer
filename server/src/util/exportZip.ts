import AssignmentExport from "../models/AssignmentExport";
import File from "../models/File";
import { getManager } from "typeorm";
import Submission from "../models/Submission";
import JSZip from "jszip";
import fs from "fs";
import config from "config";
import path from "path";
const exportToZip = async function (
  assignmentExport: AssignmentExport,
  sortedSubmissions: Submission[],
  fileName: string
): Promise<void> {
  const zip = new JSZip();
  const pdfs = zip.folder("pdfs");
  for (let i = 0; i < sortedSubmissions.length; i++) {
    const filePath = sortedSubmissions[i].file.getPath();
    //add student number to title instead of just 1,2,3...
    const pdfFileName = `${sortedSubmissions[i].userNetid + "_" + i}.pdf`;
    if (pdfs) {
      pdfs.file(pdfFileName, fs.readFileSync(filePath), { base64: true });
    }
  }

  const content = await zip.generateAsync({ type: "nodebuffer" });

  const uploadFolder = config.get("uploadFolder") as string;
  const file = new File(`${fileName}`, ".zip", null);

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
  const fp = path.resolve(uploadFolder, file.id.toString());
  await fs.writeFile(fp, content, () => undefined);
};

export default exportToZip;
