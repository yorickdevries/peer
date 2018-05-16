import Database from "../database";
import pgp, { PreparedStatement } from "pg-promise";
import express = require("express");

export default class UserPS {
    private static db: Database;

    public static addGroup: PreparedStatement = new PreparedStatement("add-group", 'INSERT INTO "grouplist" ' +
        '("group_name") VALUES ($1)');

    public static getGroupById: PreparedStatement = new PreparedStatement("get-group-id", 'SELECT * FROM ' +
        '"grouplist" WHERE "id" LIKE ($1)')



    /**
     * Excecutes a 'ad user' query
     * @param {e.Response} res
     * @param {string} name
     */
    public static executeAddGroup(res: express.Response, name: string) {
        this.addGroup.values = [name];
        res.json(this.db.executeQuery(this.addGroup));
    }

    /**
     * Excecutes a 'get user' query
     * @param {e.Response} res
     * @param {number} id
     */
    public static excecuteGetUserById(res: express.Response, id: number) {
        this.getGroupById.values = [id];
        res.json(this.db.executeQuery(this.getGroupById));
    }

}