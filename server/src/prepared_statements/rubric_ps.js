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
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database");
var pg_promise_1 = require("pg-promise");
var RubricPS = /** @class */ (function () {
    function RubricPS() {
    }
    /**
     * Query 'delete rubric'
     * @param {number} id - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeDeleteRubric = function (id) {
        this.deleteRubric.values = [id];
        return database_1.default.executeQuerySingleResult(this.deleteRubric);
    };
    /**
     * Query 'delete mc option'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeDeleteMCOption = function (id) {
        this.deleteMCOption.values = [id];
        return database_1.default.executeQuerySingleResult(this.deleteMCOption);
    };
    /**
     * Query 'delete MC question'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeDeleteMCQuestion = function (id) {
        this.deleteMCQuestion.values = [id];
        return database_1.default.executeQuerySingleResult(this.deleteMCQuestion);
    };
    /**
     * Query 'delete open question'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeDeleteOpenQuestion = function (id) {
        this.deleteOpenQuestion.values = [id];
        return database_1.default.executeQuerySingleResult(this.deleteOpenQuestion);
    };
    /**
     * Query 'delte range qustion'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeDeleteRangeQuestion = function (id) {
        this.deleteRangeQuestion.values = [id];
        return database_1.default.executeQuerySingleResult(this.deleteRangeQuestion);
    };
    /**
     * executes 'update mc option' query
     * @param {string} option
     * @param {number} mcquestion_id
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeUpdateMCOption = function (option, mcquestionId, id) {
        this.updateMCOption.values = [option, mcquestionId, id];
        return database_1.default.executeQuerySingleResult(this.updateMCOption);
    };
    /**
     * executes 'update mc question' query
     * @param {string} question - question
     * @param {number} rubric_assignment_id - rubric_assignment_id
     * @param {number} question_number - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeUpdateMCQuestion = function (question, rubricAssignmentId, questionNumber, id) {
        this.updateMCQuestion.values = [question, rubricAssignmentId, questionNumber, id];
        return database_1.default.executeQuerySingleResult(this.updateMCQuestion);
    };
    /**
     * executes 'update range question' query
     * @param {string} question - question
     * @param {number} range - range
     * @param {number} rubric_assignment_id - rubric_assignment_id
     * @param {number} question_number - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeUpdateRangeQuestion = function (question, range, rubricAssignmentId, questionNumber, id) {
        this.updateRangeQuestion.values = [question, range, rubricAssignmentId, questionNumber, id];
        return database_1.default.executeQuerySingleResult(this.updateRangeQuestion);
    };
    /**
     * executes 'update open question' query
     * @param {string} question - question
     * @param {number} rubric_assignment_id - rubric_assignment_id
     * @param {number} question_number - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeUpdateOpenQuestion = function (question, rubricAssignmentId, questionNumber, id) {
        this.updateOpenQuestion.values = [question, rubricAssignmentId, questionNumber, id];
        return database_1.default.executeQuerySingleResult(this.updateOpenQuestion);
    };
    /**
     * executes 'create MC option' query
     * @param {string} option - option
     * @param {number} mcquestion_id - mcquestion_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeCreateMCOption = function (option, mcquestionId) {
        this.createMCOption.values = [option, mcquestionId];
        return database_1.default.executeQuerySingleResult(this.createMCOption);
    };
    /**
     * executes 'create range question' query
     * @param {string} question - question
     * @param {number} range - range
     * @param {number} rubric_assignment_id - rubric_assignment_id
     * @param {number} question_number - question_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeCreateRangeQuestion = function (question, range, rubricAssignmentId, questionNumber) {
        this.createRangeQuestion.values = [question, range, rubricAssignmentId, questionNumber];
        return database_1.default.executeQuerySingleResult(this.createRangeQuestion);
    };
    /**
     * executes 'create mc question' query
     * @param {string} question - question
     * @param {number} rubric_assignment_id - rubric_assignment_id
     * @param {number} question_number - question_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeCreateMCQuestion = function (question, rubricAssignmentId, questionNumber) {
        this.createMCQuestion.values = [question, rubricAssignmentId, questionNumber];
        return database_1.default.executeQuerySingleResult(this.createMCQuestion);
    };
    /**
     * executes 'create open question' query
     * @param {string} question - question
     * @param {number} assignmentId - assignment_id
     * @param {number} questionNr - questino_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeCreateOpenQuestion = function (question, assignmentId, questionNr) {
        this.createOpenQuestion.values = [question, assignmentId, questionNr];
        return database_1.default.executeQuerySingleResult(this.createOpenQuestion);
    };
    /**
     * executes 'create rubric' query
     * @param {number} assignmentId - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeCreateRubric = function (assignmentId) {
        this.createRubric.values = [assignmentId];
        return database_1.default.executeQuerySingleResult(this.createRubric);
    };
    /**
     * executes 'get rubric by id' query
     * @param {number} assignmentId - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    RubricPS.executeGetRubricById = function (assignmentId) {
        this.getRubricById.values = [assignmentId];
        return database_1.default.executeQuerySingleResult(this.getRubricById);
    };
    /**
     * executes 'get all options by id' query
     * @param {number} id - mcquestion_id
     * @returns {any}
     */
    RubricPS.executeGetAllMCOptionById = function (id) {
        this.getAllMCOptionById.values = [id];
        return database_1.default.executeQuery(this.getAllMCOptionById);
    };
    /**
     * executes 'get all range questions' query
     * @param {number} id - assignment_id
     * @returns {any}
     */
    RubricPS.executeGetAllRangeQuestionById = function (id) {
        this.getAllRangeQuestionById.values = [id];
        return database_1.default.executeQuery(this.getAllRangeQuestionById);
    };
    /**
     * executes 'get all open questions' query
     * @param {number} id - assignment_id
     * @returns {any}
     */
    RubricPS.executeGetAllOpenQuestionById = function (id) {
        this.getAllOpenQuestionById.values = [id];
        return database_1.default.executeQuery(this.getAllOpenQuestionById);
    };
    /**
     * executes 'get all MC questions' qeury
     * @param {number} id - assignment_id
     * @returns {any}
     */
    RubricPS.executeGetAllMCQuestionById = function (id) {
        this.getAllMCQuestionById.values = [id];
        return database_1.default.executeQuery(this.getAllMCQuestionById);
    };
    /**
     * Funtion that creates the rubric of all questions
     * @param {number} rubric_id - rubric_id
     * @returns {Promise<any[]>}
     */
    RubricPS.getAllQuestionsByRubricId = function (rubricId) {
        return __awaiter(this, void 0, void 0, function () {
            var mcQuestions, openQuestions, rangeQuestions, questionJson, i, _a, _b, _c, i, i;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, RubricPS.executeGetAllMCQuestionById(rubricId)];
                    case 1:
                        mcQuestions = _d.sent();
                        return [4 /*yield*/, RubricPS.executeGetAllOpenQuestionById(rubricId)];
                    case 2:
                        openQuestions = _d.sent();
                        return [4 /*yield*/, RubricPS.executeGetAllRangeQuestionById(rubricId)];
                    case 3:
                        rangeQuestions = _d.sent();
                        questionJson = [];
                        i = 0;
                        _d.label = 4;
                    case 4:
                        if (!(i < mcQuestions.length)) return [3 /*break*/, 7];
                        _b = (_a = questionJson).push;
                        _c = {
                            id: mcQuestions[i].id,
                            type_question: mcQuestions[i].type_question,
                            question: mcQuestions[i].question,
                            question_number: mcQuestions[i].question_number
                        };
                        return [4 /*yield*/, RubricPS.executeGetAllMCOptionById(mcQuestions[i].id)];
                    case 5:
                        _b.apply(_a, [(_c.option = _d.sent(),
                                _c)]);
                        _d.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7:
                        for (i = 0; i < openQuestions.length; i++) {
                            questionJson.push(openQuestions[i]);
                        }
                        for (i = 0; i < rangeQuestions.length; i++) {
                            questionJson.push(rangeQuestions[i]);
                        }
                        return [2 /*return*/, questionJson];
                }
            });
        });
    };
    RubricPS.createRubric = new pg_promise_1.PreparedStatement("create-rubric", 'INSERT INTO "rubric" ("assignment_id") VALUES ($1) RETURNING *');
    RubricPS.getRubricById = new pg_promise_1.PreparedStatement("get-rubric-by-id", "SELECT * FROM rubric WHERE assignment_id=$1");
    RubricPS.createOpenQuestion = new pg_promise_1.PreparedStatement("make-open-question", "INSERT INTO openquestion (question, rubric_assignment_id, question_number) VALUES ($1, $2, $3) RETURNING *");
    RubricPS.createMCQuestion = new pg_promise_1.PreparedStatement("make-MC-question", "INSERT INTO mcquestion (question, rubric_assignment_id, question_number) VALUES ($1, $2, $3) RETURNING *");
    RubricPS.createRangeQuestion = new pg_promise_1.PreparedStatement("make-range-question", "INSERT INTO rangequestion (question, range, rubric_assignment_id, question_number) VALUES ($1, $2, $3, $4) RETURNING *");
    RubricPS.createMCOption = new pg_promise_1.PreparedStatement("make-MC-option", "INSERT INTO mcoption (option, mcquestion_id) VALUES ($1, $2) RETURNING *");
    RubricPS.updateOpenQuestion = new pg_promise_1.PreparedStatement("update-open-question", "UPDATE openquestion SET (question, rubric_assignment_id, question_number) = ($1, $2, $3) WHERE id = $4 RETURNING *");
    RubricPS.updateRangeQuestion = new pg_promise_1.PreparedStatement("update-range-question", "UPDATE rangequestion SET (question, range, rubric_assignment_id, question_number) = ($1, $2, $3, $4) WHERE id = $5 RETURNING *");
    RubricPS.updateMCQuestion = new pg_promise_1.PreparedStatement("update-mc-question", "UPDATE mcquestion SET (question, rubric_assignment_id, question_number) = ($1, $2, $3) WHERE id = $4 RETURNING *");
    RubricPS.updateMCOption = new pg_promise_1.PreparedStatement("updat-mc-option", "UPDATE mcoption SET (option, mcquestion_id) = ($1, $2) WHERE id = $3 RETURNING *");
    RubricPS.getAllMCQuestionById = new pg_promise_1.PreparedStatement("get-all-MC-questions", "SELECT * FROM mcquestion WHERE rubric_assignment_id = $1");
    RubricPS.getAllOpenQuestionById = new pg_promise_1.PreparedStatement("get-all-openquestions", "SELECT * FROM openquestion WHERE rubric_assignment_id = $1");
    RubricPS.getAllRangeQuestionById = new pg_promise_1.PreparedStatement("get-all-rangequestion", "SELECT * FROM rangequestion WHERE rubric_assignment_id = $1");
    RubricPS.getAllMCOptionById = new pg_promise_1.PreparedStatement("get-all-options", "SELECT * FROM mcoption WHERE mcquestion_id = $1");
    RubricPS.deleteMCOption = new pg_promise_1.PreparedStatement("delte-mc-option", "DELETE FROM mcoption WHERE id=$1 RETURNING *");
    RubricPS.deleteMCQuestion = new pg_promise_1.PreparedStatement("delete-mc-question", "DELETE FROM mcquestion WHERE id=$1 RETURNING *");
    RubricPS.deleteOpenQuestion = new pg_promise_1.PreparedStatement("delete-open-question", "DELETE FROM openquestion WHERE id=$1 RETURNING *");
    RubricPS.deleteRangeQuestion = new pg_promise_1.PreparedStatement("delete-range-question", "DELETE FROM rangequestion WHERE id=$1 RETURNING *");
    RubricPS.deleteRubric = new pg_promise_1.PreparedStatement("delete-rubric", "DELETE FROM rubric WHERE assignment_id=$1 RETURNING *");
    return RubricPS;
}());
exports.default = RubricPS;
