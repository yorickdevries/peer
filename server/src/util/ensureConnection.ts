import { dataSource } from "../databaseConnection";

// makes sure a connection is established as functions might run in a separate process
const ensureConnection = async function (): Promise<void> {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
};

export default ensureConnection;
