import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";
import express = require("express");

export default class UserPS {
    public static addUser: PreparedStatement = new PreparedStatement("add-user",
        'INSERT INTO "userlist" ("netid", "email") VALUES ($1, $2)');

    public static getUserById: PreparedStatement = new PreparedStatement("get-user-by-id",
        'SELECT * FROM "userlist" WHERE "netid" LIKE $1');
    public static getUserByEmail: PreparedStatement = new PreparedStatement("get-user-by-email",
        'SELECT * FROM "userlist" WHERE "email" LIKE $1');

    public static getCoursesIdById: PreparedStatement = new PreparedStatement("get-courses-by-id",
        'SELECT * FROM "enroll" WHERE "user_netid" LIKE $1');

    public static getGroupsById: PreparedStatement = new PreparedStatement("get-groups-by-id",
        'SELECT * FROM "groupusers" WHERE "user_netid" LIKE $1');

    public static getSubmissionsById: PreparedStatement = new PreparedStatement("get-submissions-by-id",
        'SELECT * FROM "submission" WHERE "user_netid" LIKE $1');

    public static getReviewsById: PreparedStatement = new PreparedStatement("get-reviews-by-id",
        'SELECT * FROM "review" WHERE "user_netid" LIKE $1');

    /**
     * Executes an 'add user query'.
     * @param {string} netId - a net id.
     * @param {string} email - an email.
     * @return {any} a query result.
     */
    public static executeAddUser(netId: string, email: string | undefined): Promise<pgPromise.queryResult> {
        this.addUser.values = [netId, email];
        return Database.executeQuery(this.addUser);
    }

    /**
     * Executes a 'get user by user id' query.
     * @param {string} netId - an user id.
     * @return {any} a query result.
     */
    public static async executeGetUserById(netId: string): Promise<pgPromise.queryResult> {
        this.getUserById.values = [netId];
        return Database.executeQuerySingleResult(this.getUserById);
    }

    /**
     * Executes a 'get user by email' query.
     * @param {string} email - an email.
     * @return {any} a query result.
     */
    public static executeGetUserByEmail(email: string): Promise<pgPromise.queryResult> {
        this.getUserByEmail.values = [email];
        return Database.executeQuery(this.getUserByEmail);
    }

    /**
     * Executes a 'get courses ids by user id' query.
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    public static executeGetCoursesIdById(userId: number): Promise<pgPromise.queryResult> {
        this.getCoursesIdById.values = [userId];
        return Database.executeQuery(this.getCoursesIdById);
    }

    /**
     * Executes a 'get group by user id' query.
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    public static executeGetGroupsById(userId: number): Promise<pgPromise.queryResult> {
        this.getGroupsById.values = [userId];
        return Database.executeQuery(this.getGroupsById);
    }

    /**
     * Executes a 'get submission by user id' query.
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    public static executeGetSubmissionById(userId: number): Promise<pgPromise.queryResult> {
        this.getSubmissionsById.values = [userId];
        return Database.executeQuery(this.getSubmissionsById);
    }

    /**
     * Executes a 'get review by user id' query.
     * @param {number} userId
     * @return {any} a query result.
     */
    public static executeGetReviewById(userId: number): Promise<pgPromise.queryResult> {
        this.getReviewsById.values = [userId];
        return Database.executeQuery(this.getReviewsById);
    }
}