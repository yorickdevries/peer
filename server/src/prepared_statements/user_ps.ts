import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Executes User prepared statements in the database.
 */
export default class UserPS {

    /**
     * Executes a 'get user by user net id' query.
     * @param {string} netId - an userid.
     * @return {any} a query result.
     */
    public static executeGetUserById(netId: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-user-by-id",
        'SELECT * FROM "userlist" WHERE "netid" = $1');
        statement.values = [netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks whether an user exists in the database
     * @param {string} netId - an user netid.
     * @return {any} a query result.
     */
    public static executeExistsUserById(netId: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("exists-user-by-id",
        'SELECT EXISTS(SELECT * FROM "userlist" WHERE "netid" = $1)');
        statement.values = [netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes an 'add user query'.
     * @param {string} netId - a netid.
     * @param {string} email - an email.
     * @return {any} a query result.
     */
    public static executeAddUser(netid: string,
        studentNumber?: number,
        firstName?: string,
        prefix?: string,
        lastName?: string,
        email?: string,
        userFunction?: string,
        displayName?: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("add-user",
        'INSERT INTO "userlist" (netid, studentNumber, firstName, prefix, lastName, email, function, displayName) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *');
        statement.values = [netid, studentNumber, firstName, prefix, lastName, email, userFunction, displayName];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Update user email.
     * @param {string} netId - a netid.
     * @param {string} email - an email.
     */
    public static executeUpdateUser(netid: string,
        studentNumber?: number,
        firstName?: string,
        prefix?: string,
        lastName?: string,
        email?: string,
        userFunction?: string,
        displayName?: string): any {
        const statement = new PreparedStatement("update-user-to-database",
        "UPDATE userlist SET studentNumber = $2, firstName = $3, prefix = $4, lastName = $5, email = $6, function = $7, displayName = $8 WHERE netid = $1 RETURNING *");
        statement.values = [netid, studentNumber, firstName, prefix, lastName, email, userFunction, displayName];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get group by user id' query.
     * @param {number} userId - a user netid.
     * @param {number} assignmentId - assignmentId
     * @return {any} a query result.
     */
    public static executeGetGroupsByNetIdByAssignmentId(userId: string, assignmentId: number): any {
        const statement = new PreparedStatement("get-groups-by-id",
        "SELECT g.group_groupid FROM groupusers g JOIN assignmentgroup a ON " +
            "g.group_groupid = a.group_id WHERE a.assignment_id = $1 AND g.user_netid = $2");
        statement.values = [assignmentId, userId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get submission by user id' query.
     * @param {number} userId - a user netid.
     * @return {any} a query result.
     */
    public static executeGetSubmissionById(userId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submissions-by-id",
        'SELECT * FROM "submission" WHERE "user_netid" LIKE $1');
        statement.values = [userId];
        return Database.executeQuery(statement);
    }
}