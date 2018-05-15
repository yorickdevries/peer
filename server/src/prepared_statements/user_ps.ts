import Database from "../database";
import pgp, { PreparedStatement } from "pg-promise";
import express = require("express");

export default class UserPS {
    private static db: Database;
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
     * @param {Response} res - a response.
     * @param {string} netid - a net id.
     * @param {string} email - an email.
     */
    public static executeAddUser(res: express.Response, netid: string, email: string) {
        this.addUser.values = [netid, email];
        res.json(this.db.executeQuery(this.addUser));
    }

    /**
     * Executes a 'get user by user id' query.
     * @param {Response} res - a response.
     * @param {number} userId - an id.
     */
    public static executeGetUserById(res: express.Response, userId: number) {
        this.getUserById.values = [userId];
        res.json(this.db.executeQuery(this.getUserById));
    }

    /**
     * Executes a 'get user by email' query.
     * @param {Response} res - a response.
     * @param {string} email - an email.
     */
    public static executeGetUserByEmail(res: express.Response, email: string) {
        this.getUserByEmail.values = [email];
        res.json(this.db.executeQuery(this.getUserByEmail));
    }

    /**
     * Executes a 'get courses ids by user id' query.
     * @param {Response} res - a response.
     * @param {number} userId - a user id.
     */
    public static executeGetCoursesIdById(res: express.Response, userId: number) {
        this.getCoursesIdById.values = [userId];
        res.json(this.db.executeQuery(this.getCoursesIdById));
    }

    /**
     * Executes a 'get group by user id' query.
     * @param {Response} res - a response.
     * @param {number} userId - a user id.
     */
    public static executeGetGroupsById(res: express.Response, userId: number) {
        this.getGroupsById.values = [userId];
        res.json(this.db.executeQuery(this.getGroupsById));
    }

    /**
     * Executes a 'get submission by user id' query.
     * @param {Response} res - a response.
     * @param {number} userId - a user id.
     */
    public static executeGetSubmissionById(res: express.Response, userId: number) {
        this.getSubmissionsById.values = [userId];
        res.json(this.db.executeQuery(this.getSubmissionsById));
    }

    /**
     * Executes a 'get review by user id' query.
     * @param {Response} res - a response.
     * @param {number} userId - a user id.
     */
    public static executeGetReviewById(res: express.Response, userId: number) {
        this.getReviewsById.values = [userId];
        res.json(this.db.executeQuery(this.getReviewsById));
    }
}