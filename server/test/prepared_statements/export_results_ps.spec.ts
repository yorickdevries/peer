import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import ExportResultsPS from "../../src/prepared_statements/export_results_ps";

describe("CoursePreparedStatement Test", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * Get review of student export json for an assignment.
     */
    it("get student export stats", async () => {
        expect(await ExportResultsPS.executeGetStudentReviewExportAssignment(1)).to.deep.equal(
            [{
                netID: "paulvanderlaan",
                approved: "0",
                disproved: "0",
                "waiting for TA": "1",
                "student total reviews": "1",
                // tslint:disable-next-line
                "studentnumber": null,
                "assignment": "Assignment 1",
                "course": "ED-3"
            }]
        );
    });

    /**
     * Get review of student export json for a course.
     */
    it("get student export stats", async () => {
        expect(await ExportResultsPS.executeGetStudentReviewExportCourse(1)).to.deep.equal(
            [{
                netID: "paulvanderlaan",
                approved: "0",
                disproved: "0",
                "waiting for TA": "1",
                "student total reviews": "1",
                // tslint:disable-next-line
                "studentnumber": null,
                "assignment": "Assignment 1",
                "course": "ED-3"
            }]
        );
    });


});