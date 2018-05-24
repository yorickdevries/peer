"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database");
var pg_promise_1 = require("pg-promise");
var CoursesPS = /** @class */ (function () {
    function CoursesPS() {
    }
    /**
     * Get all assignments that belong to a specific course.
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    CoursesPS.executeGetAssignmentsByCourseId = function (id) {
        this.getAssignmentsByCourseId.values = [id];
        return database_1.default.executeQuery(this.getAssignmentsByCourseId);
    };
    /**
     * Executes an 'update course' query
     * @param {number} id
     * @param {string} description
     * @param {string} name
     * @returns {Promise<pgPromise.queryResult>}
     */
    CoursesPS.executeUpdateCourse = function (id, description, name) {
        this.updateCourse.values = [description, name, id];
        return database_1.default.executeQuerySingleResult(this.updateCourse);
    };
    /**
     * Executes a 'create course' query
     * @param {string} description
     * @param {string} name
     * @returns {Promise<pgPromise.queryResult>}
     */
    CoursesPS.executeCreateCourse = function (description, name) {
        this.createCourse.values = [description, name];
        return database_1.default.executeQuerySingleResult(this.createCourse);
    };
    /**
     * Executes a 'get all courses' query where you all enrolled
     * @param {string} userNetId - a netid of the current user.
     * @return {any} a query result.
     */
    CoursesPS.executeGetAllEnrolledCourses = function (userNetId) {
        this.getAllEnrolledCourses.values = [userNetId];
        return database_1.default.executeQuery(this.getAllEnrolledCourses);
    };
    /**
     * Executes a 'get all courses' query
     * @return {any} a query result.
     */
    CoursesPS.executeGetAllCourses = function () {
        return database_1.default.executeQuery(this.getAllCourses);
    };
    /**
     * Executes a 'get course by id' query
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    CoursesPS.executeGetCourseById = function (id) {
        this.getCourseById.values = [id];
        return database_1.default.executeQuerySingleResult(this.getCourseById);
    };
    /**
     * Execute a 'get role by id' query.
     * @param {string} netId - a user net id.
     * @param {number} id - a course id.
     * @return {Promise<pgPromise.queryResult>} a json object containing the role, if any (as promise).
     */
    CoursesPS.executeGetRoleById = function (netId, id) {
        this.getRoleByCourseId.values = [netId, id];
        return database_1.default.executeQuerySingleResult(this.getRoleByCourseId);
    };
    CoursesPS.getAllCourses = new pg_promise_1.PreparedStatement("get-all-courses", 'SELECT * FROM "courselist"');
    CoursesPS.getAllEnrolledCourses = new pg_promise_1.PreparedStatement("get-all-courses-you-are-enrolled,", 'SELECT * FROM "courselist" WHERE "id" IN (SELECT "course_id" FROM "enroll" WHERE user_netid LIKE $1)');
    CoursesPS.getCourseById = new pg_promise_1.PreparedStatement("get-course-by-id", 'SELECT * FROM "courselist" WHERE "id" = $1');
    CoursesPS.createCourse = new pg_promise_1.PreparedStatement("create-course", 'INSERT INTO "courselist" ("description", "name") VALUES ($1, $2) RETURNING id, description, name');
    CoursesPS.updateCourse = new pg_promise_1.PreparedStatement("update-course", 'UPDATE "courselist" SET ("description", "name") = ($1, $2) WHERE "id" = $3 RETURNING id, description, name');
    CoursesPS.getAssignmentsByCourseId = new pg_promise_1.PreparedStatement("get-assignment-of-course", 'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');
    CoursesPS.getRoleByCourseId = new pg_promise_1.PreparedStatement("get-course-role", "SELECT enroll.role FROM enroll JOIN courselist ON courselist.id = enroll.course_id WHERE user_netid = $1 AND course_id = $2");
    return CoursesPS;
}());
exports.default = CoursesPS;
