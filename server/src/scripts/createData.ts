import AcademicYear from "../models/AcademicYear";
import createDatabaseConnection from "../databaseConnection";

// boolean which indicates whether the script can be run, can se set to True temporarily
const runScript = false;

const createData = async function (): Promise<void> {
  // Academic Year
  await new AcademicYear("2021/2022", true).save();
  return;
};

if (!runScript) {
  throw new Error(`Not allowed to run script`);
} else {
  createDatabaseConnection()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .then((_connection) => {
      createData()
        .then(() => {
          console.log("Created data");
          process.exit(0);
        })
        .catch((error) => {
          console.error(error);
          process.exit(1);
        });
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
