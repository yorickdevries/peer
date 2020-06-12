import "mocha";
import { expect } from "chai";

import TestData from "./test_helpers/test_data";

import ParseNetId from "../../src/old_api/parseNetId";

describe("ParseNetID tests", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * normalnetid
     */
    it("normal netid", async () => {
        const result = ParseNetId.parseNetId("normalnetid");
        expect(result).to.equal("normalnetid");
    });

    /**
     * normalnetid with @ something
     */
    it("normal netid with @something", async () => {
        const result = ParseNetId.parseNetId("normalnetid@tudelft.nl");
        expect(result).to.equal("normalnetid");
    });

    /**
     * normalnetid with numbers
     */
    it("normal netid with numbers", async () => {
        const result = ParseNetId.parseNetId("normalnetid123");
        expect(result).to.equal("normalnetid123");
    });

    /**
     * normalnetid with numbers 2
     */
    it("normal netid with numbers 2", async () => {
        const result = ParseNetId.parseNetId("n0rmaln3tid5");
        expect(result).to.equal("n0rmaln3tid5");
    });

    /**
     * invalid netid
     */
    it("invalid netid", async () => {
        const resultfunction = () => {
            return ParseNetId.parseNetId("invalid netid");
        };
        expect(resultfunction).to.throw(Error);
    });

});