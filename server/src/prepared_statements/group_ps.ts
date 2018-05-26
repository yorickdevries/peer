import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";
import express = require("express");

export default class GroupsPS {
    public static addGroup: PreparedStatement = new PreparedStatement("add-group",
        'INSERT INTO "grouplist" ("group_name") VALUES ($1) RETURNING id, group_name');

    public static addGrouptoAssignment: PreparedStatement = new PreparedStatement("add-group-to-assignment",
        'INSERT INTO "groupexercise" ("assignment_id", "group_id") VALUES ($1, $2) RETURNING assignment_id, group_id');

    public static addStudenttoGroup: PreparedStatement = new PreparedStatement("add-student-to-group",
        'INSERT INTO "groupusers" ("user_netid", "group_groupid") VALUES ($1, $2) RETURNING user_netid, group_groupid');

    public static getGroupById: PreparedStatement = new PreparedStatement("get-group-id",
        'SELECT * FROM "grouplist" WHERE "id" LIKE ($1)');

    public static getUsersOfGroupById: PreparedStatement = new PreparedStatement("get-all-users-group",
        'SELECT * FROM "groupusers" WHERE "id" LIKE ($1)');

    public static getGroupsByExericeId: PreparedStatement = new PreparedStatement("get-all-groups-per-exercise",
        'SELECT * FROM "groupexercise" WHERE "id" LIKE ($1)');


    /**
     * Executes a 'get all groups per exercise' query
     * @param {e.Response} res
     * @param {number} id
     * @return {any} a query result.
     */
    public static executeGetGroupByExerciseId (id: number): Promise<pgPromise.queryResult> {
        this.getGroupsByExericeId.values = [id];
        return Database.executeQuery(this.getGroupsByExericeId);
    }

    /**
     * Executes a 'add group' query
     * @param {e.Response} res
     * @param {string} name
     * @return {any} a query result.
     */
    public static executeAddGroup(name: string): Promise<pgPromise.queryResult> {
        this.addGroup.values = [name];
        return Database.executeQuerySingleResult(this.addGroup);
    }

    // Executes a 'add-group-to-assignment' query
    public static executeAddGrouptoAssignment(groupId: number, assignmentId: number): Promise<pgPromise.queryResult> {
        this.addGrouptoAssignment.values = [assignmentId, groupId];
        return Database.executeQuerySingleResult(this.addGrouptoAssignment);
    }

    // Executes a 'add-student-to-group' query
    public static executeAddStudenttoGroup(netId: string, groupId: number): Promise<pgPromise.queryResult> {
        this.addStudenttoGroup.values = [netId, groupId];
        return Database.executeQuerySingleResult(this.addStudenttoGroup);
    }

    /**
     * Executes a 'get group' query
     * @param {e.Response} res
     * @param {number} id
     * @return {any} a query result.
     */
    public static execcuteGetGroupById(id: number): Promise<pgPromise.queryResult> {
        this.getGroupById.values = [id];
        return Database.executeQuerySingleResult(this.getGroupById);
    }

    /**
     * Executes a 'get all users of group' query
     * @param {e.Response} res
     * @param {number} id
     * @return {any} a query result.
     */
    public static executeGetUsersOfGroupById(id: number): Promise<pgPromise.queryResult> {
        this.getUsersOfGroupById.values = [id];
        return Database.executeQuery(this.getUsersOfGroupById);
    }

}