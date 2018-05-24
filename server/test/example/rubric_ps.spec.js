"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var rubric_ps_1 = require("../../src/prepared_statements/rubric_ps");
var chai_1 = require("chai");
require("mocha");
var database_1 = require("../../src/database");
// load the queryfile
var pg_promise_1 = require("pg-promise");
var qf = new pg_promise_1.QueryFile("../../../database_dumps/ED3-TestDataBase.sql");
describe("RubricPreparedStatements Test", function () {
    /**
     * Make a clean database before each test.
     */
    beforeEach(function (done) {
        database_1.default.DatabaseImport(qf).then(done);
    });
    /**
     * Test to create a rubric
     */
    it("create rubric", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    rubric_ps_1.default.executeDeleteRubric(1);
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeCreateRubric(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        assignment_id: 1
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to get info about a rubric
     */
    it("get rubric", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeGetRubricById(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        assignment_id: 1
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to create open question
     */
    it("create open quetion", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeCreateOpenQuestion("hi", 1, 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 2,
                        question: "hi",
                        question_number: 1,
                        rubric_assignment_id: 1,
                        type_question: "open"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to create mc question
     */
    it("create mc quetion", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeCreateMCQuestion("hi", 1, 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 2,
                        question: "hi",
                        question_number: 1,
                        rubric_assignment_id: 1,
                        type_question: "mc"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to create open question
     */
    it("create range quetion", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeCreateRangeQuestion("hi", 6, 1, 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 2,
                        question: "hi",
                        question_number: 1,
                        rubric_assignment_id: 1,
                        range: 6,
                        type_question: "range"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to create mc option
     */
    it("create mc option", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeCreateMCOption("hi", 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 4,
                        mcquestion_id: 1,
                        option: "hi"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to update an open question
     */
    it("update open question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeUpdateOpenQuestion("hi2", 1, 1, 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 1,
                        question: "hi2",
                        question_number: 1,
                        rubric_assignment_id: 1,
                        type_question: "open"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to update an range question
     */
    it("update range question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeUpdateRangeQuestion("hi2", 6, 1, 1, 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 1,
                        question: "hi2",
                        question_number: 1,
                        range: 6,
                        rubric_assignment_id: 1,
                        type_question: "range"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to update a mc question
     */
    it("update mc question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeUpdateMCQuestion("hi2", 1, 1, 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 1,
                        question: "hi2",
                        question_number: 1,
                        rubric_assignment_id: 1,
                        type_question: "mc"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to update a mc option
     */
    it("update mc option", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeUpdateMCOption("hi2", 1, 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 1,
                        option: "hi2",
                        mcquestion_id: 1
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to get all mc questions by an id
     */
    it("get mc question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeGetAllMCQuestionById(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal([{
                            id: 1,
                            question: "What is the best way to insert queries?",
                            question_number: 3,
                            rubric_assignment_id: 1,
                            type_question: "mc"
                        }]);
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to get all open questions by an id
     */
    it("get open question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeGetAllOpenQuestionById(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal([{
                            id: 1,
                            question: "How to insert queries?",
                            question_number: 1,
                            rubric_assignment_id: 1,
                            type_question: "open"
                        }]);
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to get all range questions by an id
     */
    it("get range question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeGetAllRangeQuestionById(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal([{
                            id: 1,
                            question: "How much fun is inserting queries?",
                            range: 7,
                            question_number: 2,
                            rubric_assignment_id: 1,
                            type_question: "range"
                        }]);
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to get all mc option by an id
     */
    it("get mc option", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeGetAllMCOptionById(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal([{
                            id: 1,
                            mcquestion_id: 1,
                            option: "By using pgAdmin"
                        },
                        {
                            id: 2,
                            mcquestion_id: 1,
                            option: "By using command line"
                        },
                        {
                            id: 3,
                            mcquestion_id: 1,
                            option: "By asking Brian"
                        }]);
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to delete a rubric
     */
    it("delete rubric", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeDeleteRubric(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        assignment_id: 1
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to delete a open question
     */
    it("delete open question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeDeleteOpenQuestion(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        rubric_assignment_id: 1,
                        id: 1,
                        question: "How to insert queries?",
                        question_number: 1,
                        type_question: "open"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to delete a range question
     */
    it("delete range question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeDeleteRangeQuestion(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        rubric_assignment_id: 1,
                        id: 1,
                        question: "How much fun is inserting queries?",
                        question_number: 2,
                        range: 7,
                        type_question: "range"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to delete a mc question
     */
    it("delete mc question", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeDeleteMCQuestion(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        rubric_assignment_id: 1,
                        id: 1,
                        question: "What is the best way to insert queries?",
                        question_number: 3,
                        type_question: "mc"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test to delete a mc option
     */
    it("delete mc option", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.executeDeleteMCOption(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        id: 1,
                        mcquestion_id: 1,
                        option: "By using pgAdmin"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test get whole rubric
     */
    it("get whole rubric", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, rubric_ps_1.default.getAllQuestionsByRubricId(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal([
                        {
                            "id": 1,
                            "option": [
                                {
                                    "id": 1,
                                    "mcquestion_id": 1,
                                    "option": "By using pgAdmin"
                                },
                                {
                                    "id": 2,
                                    "mcquestion_id": 1,
                                    "option": "By using command line"
                                },
                                {
                                    "id": 3,
                                    "mcquestion_id": 1,
                                    "option": "By asking Brian"
                                }
                            ],
                            "question": "What is the best way to insert queries?",
                            "question_number": 3,
                            "type_question": "mc",
                        },
                        {
                            "id": 1,
                            "question": "How to insert queries?",
                            "question_number": 1,
                            "rubric_assignment_id": 1,
                            "type_question": "open"
                        },
                        {
                            "id": 1,
                            "question": "How much fun is inserting queries?",
                            "question_number": 2,
                            "range": 7,
                            "rubric_assignment_id": 1,
                            "type_question": "range"
                        }
                    ]);
                    return [2 /*return*/];
            }
        });
    }); });
});
