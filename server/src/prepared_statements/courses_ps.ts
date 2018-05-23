import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";
import express = require("express");

export default class CoursesPS {
    private static getAllCourses: PreparedStatement = new PreparedStatement("get-all-courses",
        'SELECT * FROM "courselist"');

    private static getCourseById: PreparedStatement = new PreparedStatement("get-course-by-id",
        'SELECT * FROM "courselist" WHERE "id" = $1');

    private static createCourse: PreparedStatement = new PreparedStatement("create-course",
        'INSERT INTO "courselist" ("description", "name") VALUES ($1, $2) RETURNING id, description, name');

    private static updateCourse: PreparedStatement = new PreparedStatement("update-course",
        'UPDATE "courselist" SET ("description", "name") = ($1, $2) WHERE "id" = $3 RETURNING id, description, name');

    private static getAssignmentsByCourseId: PreparedStatement = new PreparedStatement("get-assignment-of-course",
        'SELECT * FROM "assignmentlist" WHERE "course_id" = $1');

    /**
     * Get all assignments that belong to a specific course.
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetAssignmentsByCourseId(id: number): Promise<pgPromise.queryResult> {
        this.getAssignmentsByCourseId.values = [id];
        return Database.executeQuery(this.getAssignmentsByCourseId);
    }


    /**
     * Executes an 'update course' query
     * @param {number} id
     * @param {string} description
     * @param {string} name
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateCourse(id: number, description: string, name: string): Promise<pgPromise.queryResult> {
        this.updateCourse.values = [description, name, id];
        return Database.executeQuerySingleResult(this.updateCourse);
    }

    /**
     * Executes a 'create course' query
     * @param {string} description
     * @param {string} name
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateCourse(description: string, name: string): Promise<pgPromise.queryResult> {
        this.createCourse.values = [description, name];
        return Database.executeQuerySingleResult(this.createCourse);
    }

    /**
     * Executes a 'get all courses' query
     * @param {e.Response} res
     * @return {any} a query result.
     */
    public static executeGetAllCourses(): Promise<pgPromise.queryResult> {
        return Database.executeQuery(this.getAllCourses);
    }

    /**
     * Executes a 'get course by id' query
     * @param {e.Response} res
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetCourseById(id: number): Promise<pgPromise.queryResult> {
        this.getCourseById.values = [id];
        return Database.executeQuerySingleResult(this.getCourseById);
    }



}