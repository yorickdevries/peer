import CoursePS from "../../src/prepared_statements/rubric_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-FullDataBase.sql");

describe("RubricPreparedStatements Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach((done) => {
        Database.DatabaseImport(qf).then(done);
    });
    


    // /**
    //  * Test update a course
    //  */
    // it("update a course", async () => {
    //     expect(await CoursePS.executeUpdateCourse(1, "hi", "super leuk")).to.deep.equal({
    //         description: "hi",
    //         id: 1,
    //         name: "super leuk"
    //     });
    // });





});