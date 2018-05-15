import Database from "../database";
import pgp, {PreparedStatement} from "pg-promise";

export default class UserPS {
    private db: Database;
    private addUserQ : PreparedStatement;

    /**
     * Constructor for a user prepared statement (PS) object.
     * Used to create and execute PS on the database.
     */
    constructor() {
        this.db = new Database();
        this.addUserQ = new PreparedStatement('add-user', 'INSERT INTO "userlist" ("netid", "email") VALUES ($1, $2)');

    }

    /**
     * Executes a add user query.
     * @param {string} netid - a net id from the user.
     * @param {string} email - an email from the user.
     */
    public executeAddUser(netid : string, email : string) {
        this.addUserQ.values = [netid, email];
        this.db.executeQuery(this.addUserQ);
    }
}