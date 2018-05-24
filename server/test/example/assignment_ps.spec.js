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
var assignment_ps_1 = require("../../src/prepared_statements/assignment_ps");
var chai_1 = require("chai");
require("mocha");
var database_1 = require("../../src/database");
// load the queryfile
var pg_promise_1 = require("pg-promise");
var qf = new pg_promise_1.QueryFile("../../../database_dumps/ED3-TestDataBase.sql");
describe("AssignmentPreparedStatements Test", function () {
    /**
     * Make a clean database before each test.
     */
    beforeEach(function (done) {
        database_1.default.DatabaseImport(qf).then(done);
    });
    /**
     * Test get assignments by course id.
     */
    it("get assignments by course id", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = chai_1.expect([{
                            "course_id": 1,
                            "description": "Example assignment number one",
                            "due_date": new Date("2018-05-01T20:30:00Z"),
                            "filename": "assignment/test_file.pdf",
                            "id": 1,
                            "publish_date": new Date("2018-04-01T20:30:00Z"),
                            "title": "Assignment 1"
                        }]).to.deep).equal;
                    return [4 /*yield*/, assignment_ps_1.default.executeGetAssignments(1)];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test get assignments by course id and assignment id.
     */
    it("get assignments by course id and assignment id", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, assignment_ps_1.default.executeGetAssignmentById(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        title: "Assignment 1",
                        description: "Example assignment number one",
                        "due_date": new Date("2018-05-01T20:30:00Z"),
                        "filename": "assignment/test_file.pdf",
                        "id": 1,
                        "publish_date": new Date("2018-04-01T20:30:00Z"),
                        course_id: 1
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test add assignments.
     */
    it("add assignment", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, assignment_ps_1.default.executeAddAssignment("New", "Description", new Date("2018-07-01T20:30:00Z"), new Date("2018-06-01T20:30:00Z"), 1, "assignment/test_file.pdf")];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        course_id: 1,
                        description: "Description",
                        id: 2,
                        title: "New",
                        due_date: new Date("2018-07-01T20:30:00Z"),
                        "filename": "assignment/test_file.pdf",
                        publish_date: new Date("2018-06-01T20:30:00Z"),
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test update assignments.
     */
    it("update assignment", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, assignment_ps_1.default.executeUpdateAssignmentById("Updated", "updated", 1, 1, "assignment/test_file.pdf")];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        course_id: 1,
                        description: "updated",
                        "filename": "assignment/test_file.pdf",
                        id: 1,
                        title: "Updated"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test get review assignment.
     */
    it("get review", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, assignment_ps_1.default.executeGetReviewByAssignmentId(1, 'henkjan')];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        "comment": "Plagiaat",
                        "done": false,
                        "id": 1,
                        "rubric_assignment_id": 1,
                        "submission_id": 1,
                        "user_netid": "henkjan"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test create review.
     */
    it("create review", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, assignment_ps_1.default.executeCreateReviewByAssignmentId('paulvanderlaan', 1, 1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal({
                        "comment": "",
                        "done": false,
                        "id": 2,
                        "rubric_assignment_id": 1,
                        "submission_id": 1,
                        "user_netid": "paulvanderlaan"
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    /**
     * Test get all submissions.
     */
    it("get all submissions", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = chai_1.expect;
                    return [4 /*yield*/, assignment_ps_1.default.executeGetAllSubmissionsByAssignmentId(1)];
                case 1:
                    _a.apply(void 0, [_b.sent()]).to.deep.equal([{
                            "file_path": "folder/verygudsubmission.pdf",
                            "id": 1,
                            "assignment_id": 1,
                            "user_netid": "paulvanderlaan"
                        }]);
                    return [2 /*return*/];
            }
        });
    }); });
});
