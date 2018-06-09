import { QueryFile } from "pg-promise";
import Database from "../../src/database";

/**
 * Initializes data used for testing
 */
export default class TestData {
    // load the queryfiles
    static qfSchema = new QueryFile("../../../database_dumps/ED3-DataBaseSchema.sql");
    static qfData = new QueryFile("../../../database_dumps/ED3-TestData.sql");

    // initializes the database with testdata
    static async initializeDatabase() {
        await Database.DatabaseDrop();
        await Database.DatabaseImport(this.qfSchema);
        await Database.DatabaseImport(this.qfData);
    }
}
