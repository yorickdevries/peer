import "mocha";
import { expect } from "chai";
import TestData from "../test_helpers/test_data";

import ExportResultsPS from "../../src/old_api/prepared_statements/export_results_ps";

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
        expect(await ExportResultsPS.executeGetStudentSubmissionReviewExportAssignment(1)).to.deep.equal(
            [{
                netID: "paulvanderlaan",
                approved: "0",
                flagged: "0",
                disapproved: "0",
                "waiting for TA": "1",
                "student total reviews": "1",
                "studentnumber": null
            }]
        );
    });

    /**
     * Get review of student export json for a course.
     */
    it("get student export stats", async () => {
        expect(await ExportResultsPS.executeGetStudentSubmissionReviewExportCourse(1)).to.deep.equal(
            [{
                netID: "paulvanderlaan",
                approved: "0",
                disapproved: "0",
                "waiting for TA": "1",
                "student total reviews": "1",
                "studentnumber": null,
                "flagged": "0"
            }]
        );
    });


});