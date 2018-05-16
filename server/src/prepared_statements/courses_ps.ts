import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";
import express = require("express");

export default class CoursesPS {
    public static getAllCourses: PreparedStatement = new PreparedStatement("get-all-courses",
        'SELECT * FROM "courselist"');

    public static getCourseById: PreparedStatement = new PreparedStatement("get-course-by-id",
        'SELECT * FROM "courselist" WHERE "id" LIKE $1');

    public static createCourse: PreparedStatement = new PreparedStatement("create-course",
        'INSERT INTO "courselist" ("description", "name") VALUES ($1, $2)');


    public static executeCreateCourse(description: string, name: string): Promise<pgPromise.queryResult> {
        this.createCourse.values = [description, name];
        return Database.executeQuery(this.createCourse);
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
        return Database.executeQuery(this.getCourseById);
    }



}