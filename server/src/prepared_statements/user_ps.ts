import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Executes User prepared statements in the database.
 *
 * @export
 * @class UserPS
 */
export default class UserPS {
    /**
     * Executes a 'get user by user id' query.
     * @param {string} netId - an user id.
     * @return {any} a query result.
     */
    public static async executeGetUserById(netId: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-user-by-id",
        'SELECT * FROM "userlist" WHERE "netid" = $1');
        statement.values = [netId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes an 'add user query'.
     * @param {string} netId - a net id.
     * @param {string} email - an email.
     * @return {any} a query result.
     */
    public static executeAddUser(netId: string, email: string | undefined): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("add-user",
        'INSERT INTO "userlist" ("netid", "email") VALUES ($1, $2) RETURNING *');
        statement.values = [netId, email];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Update user email
     *
     * @param {string} netId
     * @param {string} email
     */
    public static executeUpdateEmailUser(netId: string, email: string): any {
        const statement = new PreparedStatement("update-user-to-database",
        "UPDATE userlist SET email = $2 WHERE netid = $1 RETURNING *");
        statement.values = [netId, email];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes a 'get user by email' query.
     * @param {string} email - an email.
     * @return {any} a query result.
     */
    public static executeGetUserByEmail(email: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-user-by-email",
        'SELECT * FROM "userlist" WHERE "email" LIKE $1');
        statement.values = [email];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get courses ids by user id' query.
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    public static executeGetCoursesIdById(userId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-courses-by-id",
        'SELECT * FROM "enroll" WHERE "user_netid" LIKE $1');
        statement.values = [userId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get group by user id' query.
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    public static executeGetGroupsById(userId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-groups-by-id",
        'SELECT * FROM "groupusers" WHERE "user_netid" LIKE $1 ');
        statement.values = [userId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get group by user id' query.
     * @param {number} userId - a user id.
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
     * @param {number} userId - a user id.
     * @return {any} a query result.
     */
    public static executeGetSubmissionById(userId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-submissions-by-id",
        'SELECT * FROM "submission" WHERE "user_netid" LIKE $1');
        statement.values = [userId];
        return Database.executeQuery(statement);
    }

    /**
     * Executes a 'get review by user id' query.
     * @param {number} userId
     * @return {any} a query result.
     */
    public static executeGetReviewById(userId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-reviews-by-id",
        'SELECT * FROM "review" WHERE "user_netid" LIKE $1');
        statement.values = [userId];
        return Database.executeQuery(statement);
    }
}