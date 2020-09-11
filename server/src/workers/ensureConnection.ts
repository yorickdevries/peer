import { getConnection } from "typeorm";
import createDatabaseConnection from "../databaseConnection";

// makes sure a connection is established as functions might run in a separate process
const ensureConnection = async function (): Promise<void> {
  try {
    getConnection();
  } catch (error) {
    await createDatabaseConnection();
  }
};

export default ensureConnection;
