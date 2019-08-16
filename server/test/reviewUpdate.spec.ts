import "mocha";
import chai from "chai";
import { expect } from "chai";
import chaiAsPromised from "chai-as-promised";

chai.use(chaiAsPromised);

import TestData from "./test_helpers/test_data";
import ReviewUpdate from "../src/reviewUpdate";

describe("ReviewUpdate Class tests", () => {
    /**
     * Make a clean database before each test.
     */
    beforeEach(async () => {
        await TestData.initializeDatabase();
    });

    /**
     * good weather test
     */
    it("normal review update", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "mc",
                },
                answer: {answer: 1}
            }, {
                question: {
                    id: 1,
                    type_question: "open"
                },
                answer: {answer: "Flesje water is beter dan flesje bier"}
            }, {
                question: {
                    id: 1,
                    type_question: "range"
                }, answer: {answer: 4}
            }];
        const result = await ReviewUpdate.updateReview(1, formdata);
        expect(result.form[0].answer.answer).to.equal("Flesje water is beter dan flesje bier");
        expect(result.form[1].answer.answer).to.equal(4);
        expect(result.form[2].answer.answer).to.equal(1);
        expect(result.form[3].answer.answer).to.equal(undefined);
    });

    /**
     * bad weather tests
     */
    it("Wrong Open question number", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 2,
                    type_question: "open"
                },
                answer: {answer: "New answer"}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("Wrong Open Question: 2");
    });

    it("Wrong MC question number", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 30,
                    type_question: "mc"
                },
                answer: {answer: 1}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("Wrong MC Question: 30");
    });

    it("Wrong range question number", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 40,
                    type_question: "range"
                },
                answer: {answer: 1}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("Wrong Range Question: 40");
    });

    it("Missing question", async () => {
        // set up input data
        const formdata = [
            {
                answer: {answer: "New answer"}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("Question isn't formatted properly at index: 0");
    });

    it("Missing answer", async () => {
        // set up input data
        const formdata = [{
            question: {
                id: 1,
                type_question: "open"
            }
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("Question isn't formatted properly at index: 0");
    });

    it("Question number undefined", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: undefined,
                    type_question: "open"
                },
                answer: {answer: "New answer"}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("Question isn't formatted properly at index: 0");
    });

    it("Question type wrong", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "something_else"
                },
                answer: {answer: "New answer"}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("Unrecognized question type: something_else");
    });

    it("Question type undefined", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: undefined
                },
                answer: {answer: "New answer"}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("Unrecognized question type: undefined");
    });

    it("Wrong MC answer 1", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "mc"
                },
                answer: {answer: 1000}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following MC Question has an invalid answer: 1");
    });

    it("Wrong MC answer 2", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "mc"
                },
                answer: {answer: "text"}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following MC Question has an invalid answer: 1");
    });

    it("Wrong range answer 1", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "range"
                },
                answer: {answer: 1000}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following Range Question has an answer out of range: 1");
    });

    it("Wrong range answer 2", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "range"
                },
                answer: {answer: -1}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following Range Question has an answer out of range: 1");
    });

    it("Wrong range answer 3", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "range"
                },
                answer: {answer: "text"}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following Range Question has an answer out of range: 1");
    });

    it("Wrong range answer 4", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "range"
                },
                answer: {answer: ""}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following Range Question has an answer out of range: 1");
    });

    it("Wrong open answer 1", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "open"
                },
                answer: {answer: 1}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following Open Question has an invalid answer: 1");
    });

    it("Wrong open answer 2", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "open"
                },
                answer: {answer: ""}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following Open Question has an invalid answer: 1");
    });

    it("Wrong open answer 3", async () => {
        // set up input data
        const formdata = [{
                question: {
                    id: 1,
                    type_question: "open"
                },
                answer: {answer: []}
        }];
        await expect(ReviewUpdate.updateReview(1, formdata))
        .to.eventually.be.rejectedWith("The following Open Question has an invalid answer: 1");
    });

});