import Database from "../database";
import pgp, {PreparedStatement} from "pg-promise";

export default class UserPS {
    private db: Database;
    private addUser             : PreparedStatement;
    private getUserById         : PreparedStatement;
    private getUserByEmail      : PreparedStatement;
    private getCoursesIdById    : PreparedStatement;
    private getGroupsById       : PreparedStatement;
    private getSubmissionsById  : PreparedStatement;

    /**
     * Constructor for a user prepared statement (PS) object.
     * Used to create and execute PS on the database.
     */
    constructor() {
        this.db = new Database();
        this.addUser        = new PreparedStatement('add-user',
            'INSERT INTO "userlist" ("netid", "email") VALUES ($1, $2)');

        this.getUserById    = new PreparedStatement('get-user-by-id',
            'SELECT * FROM "userlist" WHERE "netid" LIKE $1');

        this.getUserByEmail = new PreparedStatement('get-user-by-email',
            'SELECT * FROM "userlist" WHERE "email" LIKE $1');

        this.getCoursesIdById  = new PreparedStatement('get-courses-by-id',
            'SELECT * FROM "enroll" WHERE "user_netid" LIKE $1');

        this.getGroupsById     = new PreparedStatement('get-groups-by-id',
            'SELECT * FROM "groupusers" WHERE "user_netid" LIKE $1');

        this.getSubmissionsById = new PreparedStatement('get-submission-by-id',
            'SELECT * FROM "submission" WHERE "user_netid" LIKE $1');


    }

    /**
     * Executes a add user query.
     * @param {string} netid - a net id from the user.
     * @param {string} email - an email from the user.
     */
    public executeAddUser(netid : string, email : string) {
        this.addUser.values = [netid, email];
        this.db.executeQuery(this.addUser);
    }

    
}