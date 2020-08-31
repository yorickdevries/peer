import "reflect-metadata"; // needed for typeORM to work
import { createConnection } from "typeorm";
import * as ormconfig from "./ormconfig";
import Assignment from "./models/Assignment";
import Extensions from "./enum/Extensions";

const migrateDB = async function (): Promise<void> {
  console.log("Start migration");

  // database connection with mysql database
  const connection = await createConnection(ormconfig);
  console.log(connection.name);

  let count = 0;

  const assignments = await Assignment.find();
  for (const assignment of assignments) {
    // the actual extensions submitted
    let pdf = false;
    let zip = false;
    let doc = false;

    const submissions = await assignment.getSubmissions();
    for (const submission of submissions) {
      const file = submission.file;
      if (file.extension === ".pdf") {
        pdf = true;
      } else if (file.extension === ".zip") {
        zip = true;
      } else if (file.extension === ".doc") {
        doc = true;
      } else if (file.extension === ".docx") {
        doc = true;
      } else {
        throw new Error(`invalid extension: ${file.extension}`);
      }
    }

    if (submissions.length === 0) {
      assignment.submissionExtensions = Extensions.PDF;
    } else if (pdf && !zip && !doc) {
      assignment.submissionExtensions = Extensions.PDF;
    } else if (!pdf && zip && !doc) {
      assignment.submissionExtensions = Extensions.ZIP;
    } else if (!pdf && !zip && doc) {
      assignment.submissionExtensions = Extensions.DOC_DOCX;
    } else {
      assignment.submissionExtensions = Extensions.PDF_ZIP_DOC_DOCX;
    }
    await assignment.save();
    console.log(assignment.id, assignment.submissionExtensions);

    // validate submissions
    for (const submission of submissions) {
      await submission.validateOrReject();
    }
    count += submissions.length;
    console.log("submissions done: ", count);
  }

  console.log("Done migration");
  return;
};

// migrateDBTest()
migrateDB()
  .then(() => {
    console.log("finished succesfully");
    process.exit(0);
  })
  .catch((error) => {
    console.log(error);
    console.log("did not finish succesfully");
    process.exit(1);
  });
