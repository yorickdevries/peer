"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database");
var pg_promise_1 = require("pg-promise");
var AssignmentPS = /** @class */ (function () {
    function AssignmentPS() {
    }
    /**
     * Executes a query that gets the review that was assigned to a certain user
     * @param {number} assignment_id - assignment id
     * @param {string} net_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    AssignmentPS.executeGetReviewByAssignmentId = function (assignmentId, netId) {
        this.getReviewByAssignmentId.values = [assignmentId, netId];
        return database_1.default.executeQuerySingleResult(this.getReviewByAssignmentId);
    };
    /**
     * Executes create review for a specific assignment and user
     * @param {string} net_id - net id
     * @param {number} submission_id - submission id
     * @param {number} assignment_id - assignment id
     * @returns {Promise<pgPromise.queryResult>}
     */
    AssignmentPS.executeCreateReviewByAssignmentId = function (netId, submissionId, assignmentId) {
        this.createReviewByAssignmentId.values = [netId, submissionId, assignmentId];
        return database_1.default.executeQuerySingleResult(this.createReviewByAssignmentId);
    };
    /**
     * Executes 'get all submissions per assignment'
     * @param assignment_id - assignment_id
     */
    AssignmentPS.executeGetAllSubmissionsByAssignmentId = function (assignmentId) {
        this.getAllSubmissionsByAssignmentId.values = [assignmentId];
        return database_1.default.executeQuery(this.getAllSubmissionsByAssignmentId);
    };
    /**
     * Executes a 'get assignment by course id'.
     * @param {string} courseId - a course id.
     * @return {any} a query result.
     */
    AssignmentPS.executeGetAssignments = function (courseId) {
        this.getAssignments.values = [courseId];
        return database_1.default.executeQuery(this.getAssignments);
    };
    /**
     * Executes a 'get assignment by course id and assignment id'.
     * @param {string} courseId - a course id.
     * @param {string} assignmentId - an assignment id.
     * @return {any} a query result.
     */
    AssignmentPS.executeGetAssignmentById = function (assignmentId) {
        this.getAssignmentById.values = [assignmentId];
        return database_1.default.executeQuerySingleResult(this.getAssignmentById);
    };
    /**
     * Executes a 'insert assignment'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param dueDate - a due date.
     * @param publishDate - a publish date.
     * @param courseId - a course id.
     * @param filename - filename
     * @return {any} a query result.
     */
    AssignmentPS.executeAddAssignment = function (title, description, dueDate, publishDate, courseId, filename) {
        this.addAssignment.values = [title, description, dueDate, publishDate, courseId, filename];
        return database_1.default.executeQuerySingleResult(this.addAssignment);
    };
    /**
     * Executes a 'update assignment by assignment id'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param courseId - a course id.
     * @param assignmentId - an assignment id.
     * @return {any} a query result.
     */
    AssignmentPS.executeUpdateAssignmentById = function (title, description, courseId, assignmentId, filename) {
        this.updateAssignmentById.values = [title, description, courseId, assignmentId, filename];
        return database_1.default.executeQuerySingleResult(this.updateAssignmentById);
    };
    /**
     * Executes an 'get submission by assignment id' query
     * @param {string} netId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     */
    AssignmentPS.executeGetSubmissionByAssignmentId = function (netId, assignmentId) {
        this.getSubmissionByAssignmentId.values = [netId, assignmentId];
        return database_1.default.executeQuerySingleResult(this.getSubmissionByAssignmentId);
    };
    AssignmentPS.getAssignments = new pg_promise_1.PreparedStatement("get-assignments-by-course-id", 'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');
    AssignmentPS.getAssignmentById = new pg_promise_1.PreparedStatement("get-assignment-by-id", 'SELECT * FROM "assignmentlist" WHERE "id" = $1');
    AssignmentPS.addAssignment = new pg_promise_1.PreparedStatement("addAssignment", 'INSERT INTO "assignmentlist" ("title", "description", "due_date", "publish_date", "course_id", "filename") VALUES ($1, $2, $3, $4, $5, $6) RETURNING title, description, id, course_id, due_date, publish_date, filename');
    AssignmentPS.updateAssignmentById = new pg_promise_1.PreparedStatement("update-assignment-by-id", "UPDATE assignmentlist SET title=$1, description=$2, course_id=$3, filename=$5 WHERE id=$4  RETURNING title, description, id, course_id, filename");
    AssignmentPS.getSubmissionByAssignmentId = new pg_promise_1.PreparedStatement("get-submission-by-assignment", "SELECT * FROM sumbission WHERE user_netid = $1 AND assignment_id = $2");
    AssignmentPS.getAllSubmissionsByAssignmentId = new pg_promise_1.PreparedStatement("get-all-subbmissions-by-assignmentId", "SELECT * FROM submission WHERE assignment_id = $1");
    AssignmentPS.createReviewByAssignmentId = new pg_promise_1.PreparedStatement("make-review-for-user", "INSERT INTO review (comment, user_netid, submission_id, rubric_assignment_id) VALUES ('', $1, $2, $3) RETURNING id, comment, user_netid, submission_id, rubric_assignment_id, done");
    AssignmentPS.getReviewByAssignmentId = new pg_promise_1.PreparedStatement("get-review", "SELECT * FROM review WHERE done=FALSE AND rubric_assignment_id=$1 AND user_netid=$2");
    return AssignmentPS;
}());
exports.default = AssignmentPS;
