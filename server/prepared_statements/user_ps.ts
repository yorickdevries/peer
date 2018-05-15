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
    private getReviewsById      : PreparedStatement;

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

        this.getSubmissionsById = new PreparedStatement('get-submissions-by-id',
            'SELECT * FROM "submission" WHERE "user_netid" LIKE $1');

        this.getReviewsById = new PreparedStatement('get-reviews-by-id',
            'SELECT * FROM "review" WHERE "user_netid" LIKE $1');
    }

    /**
     * Executes an 'add user query'.
     * @param {string} netid - a net id.
     * @param {string} email - an email.
     */
    public executeAddUser(netid : string, email : string) {
        this.addUser.values = [netid, email];
        this.db.executeQuery(this.addUser);
    }

    /**
     * Executes a 'get user by user id' query.
     * @param {number} userId - an id.
     */
    public executeGetUserById(userId : number) {
        this.getUserById.values = [userId];
        this.db.executeQuery(this.getUserById);
    }

    /**
     * Executes a 'get user by email' query.
     * @param {string} email - an email.
     */
    public executeGetUserByEmail(email : string) {
        this.getUserByEmail.values = [email];
        this.db.executeQuery(this.getUserByEmail);
    }

    /**
     * Executes a 'get courses ids by user id' query.
     * @param {number} userId - a user id.
     */
    public executeGetCoursesIdById(userId : number) {
        this.getCoursesIdById.values = [userId];
        this.db.executeQuery(this.getCoursesIdById);
    }

    /**
     * Executes a 'get group by user id' query.
     * @param {number} userId - a user id.
     */
    public executeGetGroupsById(userId : number) {
        this.getGroupsById.values = [userId];
        this.db.executeQuery(this.getGroupsById);
    }

    /**
     * Executes a 'get submission by user id' query.
     * @param {number} userId - a user id.
     */
    public executeGetSubmissionById(userId : number) {
        this.getSubmissionsById.values = [userId];
        this.db.executeQuery(this.getSubmissionsById);
    }

    /**
     * Executes a 'get review by user id' query.
     * @param {number} userId - a user id.
     */
    public executeGetReviewById(userId : number) {
        this.getReviewsById.values = [userId];
        this.db.executeQuery(this.getReviewsById);
    }
}