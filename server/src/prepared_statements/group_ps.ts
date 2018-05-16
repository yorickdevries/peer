import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";
import express = require("express");

export default class GroupsPS {
    private static db: Database;

    public static addGroup: PreparedStatement = new PreparedStatement("add-group",
        'INSERT INTO "grouplist" ("group_name") VALUES ($1)');

    public static getGroupById: PreparedStatement = new PreparedStatement("get-group-id",
        'SELECT * FROM "grouplist" WHERE "id" LIKE ($1)');

    public static getUserOfGroupById: PreparedStatement = new PreparedStatement("get-all-users-group",
        'SELECT * FROM "groupusers" WHERE "id" LIKE ($1)');

    public static getGroupsByExericeId: PreparedStatement = new PreparedStatement("get-all-groups-per-exercise",
        'SELECT * FROM "groupexercise" WHERE "id" LIKE ($1)');


    /**
     * Executes a 'get all groups per exercise' query
     * @param {e.Response} res
     * @param {number} id
     * @return {any} a query result.
     */
    public static executeGetGroupByExerciseId (res: express.Response, id: number): Promise<pgPromise.queryResult> {
        this.getGroupsByExericeId.values = [id];
        return Database.executeQuery(this.getGroupsByExericeId);
    }

    /**
     * Executes a 'ad user' query
     * @param {e.Response} res
     * @param {string} name
     * @return {any} a query result.
     */
    public static executeAddGroup(res: express.Response, name: string): Promise<pgPromise.queryResult> {
        this.addGroup.values = [name];
        return Database.executeQuery(this.addGroup);
    }

    /**
     * Executes a 'get user' query
     * @param {e.Response} res
     * @param {number} id
     * @return {any} a query result.
     */
    public static execcuteGetUserById(res: express.Response, id: number): Promise<pgPromise.queryResult> {
        this.getGroupById.values = [id];
        return Database.executeQuery(this.getGroupById);
    }

    /**
     * Executes a 'get all users of group' query
     * @param {e.Response} res
     * @param {number} id
     * @return {any} a query result.
     */
    public static executeGetUserOfGroupById(res: express.Response, id: number): Promise<pgPromise.queryResult> {
        this.getUserOfGroupById.values = [id];
        return Database.executeQuery(this.getUserOfGroupById);
    }

}