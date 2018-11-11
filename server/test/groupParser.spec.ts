import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

import TestData from "./test_helpers/test_data";

import GroupParser from "../src/groupParser";
import neatCsv from "neat-csv";

// file system imports
import fs from "fs-extra";
import path from "path";

describe("GroupParser tests", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * good weather test
     */
    it("normal import", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = 3;
        const result = await GroupParser.importGroups(filebuffer, groupColumn, assignmentId);
        expect(result).to.deep.equal([{ groupId: 25, groupname: "ED 4" },
        { groupId: 26, groupname: "ED 3" }]);
    });

    it("normal import with groupnumbers", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export_groupnumbers.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = 3;
        const result = await GroupParser.importGroups(filebuffer, groupColumn, assignmentId);
        expect(result).to.deep.equal([{ groupId: 25, groupname: "4" },
        { groupId: 26, groupname: "ED 3" }]);
    });

    /**
     * bad weather tests
     */
    it("No comma separated file is used", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export_non_csv.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = 3;
        await expect(GroupParser.importGroups(filebuffer, groupColumn, assignmentId))
        .to.eventually.be.rejectedWith("NetId is undefined");
    });

    it("students misses a group field", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export_missing_group.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = 3;
        await expect(GroupParser.importGroups(filebuffer, groupColumn, assignmentId))
        .to.eventually.be.rejectedWith("bplanje@tudelft.nl does not have a group");
    });

    it("students misses a username", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export_missing_username.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = 3;
        await expect(GroupParser.importGroups(filebuffer, groupColumn, assignmentId))
        .to.eventually.be.rejectedWith("NetId is undefined");
    });

    it("student has no username field", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export_empty_username.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = 3;
        await expect(GroupParser.importGroups(filebuffer, groupColumn, assignmentId))
        .to.eventually.be.rejectedWith("NetId is an empty string");
    });

    it("some netids are without @ symbol", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export_usernames_without_at.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const studentlist = await neatCsv(filebuffer);
        const result = await GroupParser.mapGroups(studentlist, groupColumn);
        expect(result.get("ED 3")).to.deep.equal(["paulvanderlaan", "hwermelink"]);
        expect(result.get("ED 4")).to.deep.equal(["pmoelchand", "bplanje", "yorickdevries"]);
    });

    it("invalid assignment id", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = -1;
        await expect(GroupParser.importGroups(filebuffer, groupColumn, assignmentId))
        .to.eventually.be.rejectedWith("Assignment doesn't exist in the database");
    });

    it("duplicate student", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/duplicate_student.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = 3;
        await expect(GroupParser.importGroups(filebuffer, groupColumn, assignmentId))
        .to.eventually.be.rejectedWith("Duplicate student: bplanje");
    });

    it("Student has already a group", async () => {
        // set up input data
        const file = path.join(__dirname, "../example_data/csv_test/example_export.csv");
        const filebuffer = new Buffer(fs.readFileSync(file));
        const groupColumn = "Education Groups";
        const assignmentId = 1;
        await expect(GroupParser.importGroups(filebuffer, groupColumn, assignmentId))
        .to.eventually.be.rejectedWith("paulvanderlaan is already in a group");
    });

});