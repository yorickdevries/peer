import ReviewPS from "../../src/prepared_statements/review_ps";
import { expect } from "chai";
import "mocha";
import Database from "../../src/database";

// load the queryfile
import { QueryFile } from "pg-promise";
const qf = new QueryFile("../../../database_dumps/ED3-FullDataBase.sql");

describe("CoursePreparedStatement Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach((done) => {
        Database.DatabaseImport(qf).then(done);
    });

    // /**
    //  * Get all courses
    //  */
    // it("get all courses", async () => {
    //     expect(await ReviewPS.executeGetAllCourses()).to.deep.equal([{
    //         description: "This is a beautiful course description!",
    //         id: 1,
    //         name: "ED-3"
    //     }]);
    // });
});