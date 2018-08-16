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
     * Get review of student export json.
     */
    it("get student export stats", async () => {
        expect(await ExportResultsPS.executeGetStudentReviewExport(1)).to.deep.equal(
            [{
                netID: 'paulvanderlaan',
                approved: '0',
                disproved: '0',
                'waiting for TA': '1',
                'total student reviews': '1'
            }]
        );
    });


});