"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("../database");
var pg_promise_1 = require("pg-promise");
var CoursesPS = /** @class */ (function () {
    function CoursesPS() {
    }
    /**
     * Ececutes a 'get assignment' query
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    CoursesPS.executeGetAssignmentByCourseId = function (id) {
        this.getAssignmentByCourseId.values = [id];
        return database_1.default.executeQuery(this.getAssignmentByCourseId);
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
        return database_1.default.executeQuery(this.updateCourse);
    };
    /**
     * Executes a 'create course' query
     * @param {string} description
     * @param {string} name
     * @returns {Promise<pgPromise.queryResult>}
     */
    CoursesPS.executeCreateCourse = function (description, name) {
        this.createCourse.values = [description, name];
        return database_1.default.executeQuery(this.createCourse);
    };
    /**
     * Executes a 'get all courses' query
     * @param {e.Response} res
     * @return {any} a query result.
     */
    CoursesPS.executeGetAllCourses = function () {
        return database_1.default.executeQuery(this.getAllCourses);
    };
    /**
     * Executes a 'get course by id' query
     * @param {e.Response} res
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    CoursesPS.executeGetCourseById = function (id) {
        this.getCourseById.values = [id];
        return database_1.default.executeQuery(this.getCourseById);
    };
    CoursesPS.getAllCourses = new pg_promise_1.PreparedStatement("get-all-courses", 'SELECT * FROM "courselist"');
    CoursesPS.getCourseById = new pg_promise_1.PreparedStatement("get-course-by-id", 'SELECT * FROM "courselist" WHERE "id" LIKE $1');
    CoursesPS.createCourse = new pg_promise_1.PreparedStatement("create-course", 'INSERT INTO "courselist" ("description", "name") VALUES ($1, $2) RETURNING id, description, name');
    CoursesPS.updateCourse = new pg_promise_1.PreparedStatement("update-course", 'UPDATE "courselist" SET ("description", "name") = ($1, $2) WHERE "id" = $3 RETURNING id, description, name');
    CoursesPS.getAssignmentByCourseId = new pg_promise_1.PreparedStatement("get-assignment-of-course", 'SELECT * FROM "assignmentlist" WHERE "course_id" LIKE $1');
    return CoursesPS;
}());
exports.default = CoursesPS;
