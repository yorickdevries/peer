import initializeData from "../util/initializeData";
import createDatabaseConnection from "../databaseConnection";

// initialize data in case of running in development
if (!["development", "test", undefined].includes(process.env.NODE_ENV)) {
  throw new Error(`NODE_ENV is set to ${process.env.NODE_ENV}`);
}

createDatabaseConnection()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .then((_connection) => {
    initializeData()
      .then(() => {
        console.log("Initialized data");
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
