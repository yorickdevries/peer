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
     * Executes a 'get user by user id' query.
     * @param {string} netId - an user id.
     * @return {any} a query result.
     */
    public static async executeGetUserById(netId: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-user-by-id",
        'SELECT * FROM "userlist" WHERE "netid" LIKE $1');
        statement.values = [netId];
        return Database.executeQuerySingleResult(statement);
    }


    /**
     * Counts the amount of assignments with this specific id.
     *
     * @static
     * @param {string} netId
     * @returns {Promise<pgPromise.queryResult>}
     * @memberof UserPS
     */
    public static executeCountUserById(netId: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("count-user-by-id",
        'SELECT COUNT(1) FROM "userlist" WHERE "netid" = $1');
        statement.values = [netId];
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
        'SELECT * FROM "groupusers" WHERE "user_netid" LIKE $1');
        statement.values = [userId];
        return Database.executeQuery(statement);
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