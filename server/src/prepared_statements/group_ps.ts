import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for routes
 */
export default class GroupsPS {

    /**
     * Prepared statement function that gets a group with a certain id.
     * @param {number} id - group_id.
     * @returns {Promise<pgPromise.queryResult>} group as pg promise.
     */
    public static executeGetGroupById(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-group-by-id",
            'SELECT * FROM "grouplist" WHERE "id" = $1');
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Prepared statement that gets all users of a certain group.
     * @param {number} id - group_id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetUsersOfGroupById(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("get-all-users-group",
            'SELECT * FROM "groupusers" WHERE "group_groupid" = $1');
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Prepared statement function that adds a group to the database.
     * @param {string} name - name of the group.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeAddGroup(name: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("add-group",
            'INSERT INTO "grouplist" ("group_name") VALUES ($1) RETURNING id, group_name');
        statement.values = [name];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Prepared statement function that adds a group to an assignment
     * @param {number} groupId - group_id
     * @param {number} assignmentId - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeAddGrouptoAssignment(groupId: number, assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("add-group-to-assignment",
            'INSERT INTO "assignmentgroup" ("assignment_id", "group_id") VALUES ($1, $2) ' +
            "RETURNING assignment_id, group_id");
        statement.values = [assignmentId, groupId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Prepared statement that add a student to a group
     * @param {string} netId - net_id
     * @param {number} groupId - group_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeAddStudenttoGroup(netId: string, groupId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("add-student-to-group",
            'INSERT INTO "groupusers" ("user_netid", "group_groupid") VALUES ($1, $2) ' +
            "RETURNING user_netid, group_groupid");
        statement.values = [netId, groupId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Prepared statement that add a student to a group
     * @param {number} groupId - group_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteGroup(groupId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("remove-group",
            "DELETE FROM grouplist WHERE id = $1");
        statement.values = [groupId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Prepared statement that add a student to a group
     * @param {number} groupId - group_id.
     * @param netid - net id of user.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteGroupMember(groupId: number, netid: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("remove-group-member",
            "DELETE FROM groupusers WHERE user_netid = $1 AND group_groupid = $2");
        statement.values = [netid, groupId];
        return Database.executeQuerySingleResult(statement);
    }
}