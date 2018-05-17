"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database");
var pg_promise_1 = require("pg-promise");
var AssignmentPS = /** @class */ (function () {
    function AssignmentPS() {
    }
    /**
     * Executes a 'get assignment by course id'.
     * @param {string} course_id - a course id.
     * @return {any} a query result.
     */
    AssignmentPS.executeGetAssignments = function (course_id) {
        this.getAssignments.values = [course_id];
        return database_1.default.executeQuery(this.getAssignments);
    };
    /**
     * Executes a 'get assignment by course id and assignment id'.
     * @param {string} course_id - a course id.
     * @param {string} assignment_id - an assignment id.
     * @return {any} a query result.
     */
    AssignmentPS.executeGetAssignmentById = function (course_id, assignment_id) {
        this.getAssignmentById.values = [course_id, assignment_id];
        return database_1.default.executeQuery(this.getAssignmentById);
    };
    /**
     * Executes a 'insert assignment'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @return {any} a query result.
     */
    AssignmentPS.executeAddAssignment = function (title, description) {
        this.addAssignment.values = [title, description];
        return database_1.default.executeQuery(this.addAssignment);
    };
    /**
     * Executes a 'update assignment by assignment id'.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param course_id - a course id.
     * @param assignment_id - an assignment id.
     * @return {any} a query result.
     */
    AssignmentPS.executeUpdateAssignmentById = function (title, description, course_id, assignment_id) {
        this.updateAssignmentById.values = [title, description, course_id, assignment_id];
        return database_1.default.executeQuery(this.updateAssignmentById);
    };
    AssignmentPS.getAssignments = new pg_promise_1.PreparedStatement("get-assignments-by-course-id", 'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');
    AssignmentPS.getAssignmentById = new pg_promise_1.PreparedStatement("get-assignment-by-id", 'SELECT * FROM "assignmentlist" WHERE "course_id" = $1 AND "id" = $2');
    AssignmentPS.addAssignment = new pg_promise_1.PreparedStatement("addAssignment", 'INSERT INTO "assignmentlist" ("title", "description") VALUES ($1, $2) RETURNING title, description, id, course_id');
    AssignmentPS.updateAssignmentById = new pg_promise_1.PreparedStatement("update-assignment-by-id", "UPDATE assignmentlist SET title=$1, description=$2, course_id=$3 WHERE id=$4  RETURNING title, description, id, course_id");
    return AssignmentPS;
}());
exports.default = AssignmentPS;
