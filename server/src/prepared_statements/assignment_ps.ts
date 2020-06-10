import Database from "../database";
import pgPromise from "pg-promise";
import { PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for assignment.
 */
export default class AssignmentPS {

    /**
     * Checks whether an assignment exists in the database.
     * @param {number} assignmentId - id of an assignment.
     * @returns tuple with true or false depending on exists as pg promise.
     */
    public static executeExistsAssignmentById(assignmentId: number) {
        const statement = new PreparedStatement({name: "exists-assignment-by-id", text:
        'SELECT EXISTS(SELECT * FROM "assignmentlist" WHERE "id" = $1)'});
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Get all assignments that belong to a specific course.
     * @param {string} courseId - a course id of which all assignments are fetched.
     * @return {any} all assignments of the course as pg promise..
     */
    public static executeGetAssignments(courseId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-assignments-by-course-id", text:
            'SELECT * FROM "assignmentlist" WHERE "course_id" = $1'});
        statement.values = [courseId];
        return Database.executeQuery(statement);
    }

    /**
     * Get an assignment given an assignment id.
     * @param {string} assignmentId - an assignment id.
     * @return {any} an assignment as pg promise.
     */
    public static executeGetAssignmentById(assignmentId: number) {
        const statement = new PreparedStatement({name: "get-assignment-by-id", text:
            'SELECT * FROM "assignmentlist" WHERE "id" = $1'});
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Insert an assignment with several specifications.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param dueDate - a due date.
     * @param publishDate - a publish date.
     * @param courseId - a course id.
     * @param reviewsPerUser - amount of reviews a user has to do.
     * @param filename - filename of the assignment.
     * @param reviewPublishDate - after this date, students can start reviewing.
     * @param reviewDueDate - after this date, reviewing is closed.
     * @param onePersonGroups - true if the groups should contain 1 person each.
     * @param reviewEvaluation - true if the submitter should be able to review the review.
     * @param externalLink - url to the assignment.
     * @param reviewEvaluationDueDate - the due date for the review evaluation.
     * @return {any} all columns of the created assignment as pg promise.
     */
    public static executeAddAssignment(title: string, description: string, courseId: number, reviewsPerUser: number,
                                       filename: string | null, publishDate: Date, dueDate: Date, reviewPublishDate: Date,
                                       reviewDueDate: Date, onePersonGroups: boolean, reviewEvaluation: boolean, externalLink: string | undefined,
                                       reviewEvaluationDueDate?: Date): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "addAssignment", text:
        'INSERT INTO "assignmentlist" (title, description, course_id, reviews_per_user, filename, publish_date, ' +
            "due_date, review_publish_date, review_due_date, one_person_groups, review_evaluation, review_evaluation_due_date, external_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *"});
        statement.values = [title, description, courseId, reviewsPerUser, filename, publishDate, dueDate,
            reviewPublishDate, reviewDueDate, onePersonGroups, reviewEvaluation, reviewEvaluationDueDate, externalLink];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Update an assignment given its assignment id.
     * @param {string} title - a title.
     * @param {string} description - a description.
     * @param assignmentId - an assignment id.
     * @param dueDate - an assignment due date.
     * @param publishDate - an assignment publish date.
     * @param reviewsPerUser - amount of reviews a user has to do.
     * @param filename - filename of the assignment.
     * @param reviewPublishDate - after this date, students can start reviewing.
     * @param reviewDueDate - after this date, reviewing is closed.
     * @param reviewEvaluationDueDate - the due date for the review evaluation.
     * @return {any} a query result.
     */
    public static executeUpdateAssignmentById(title: string, description: string, reviewsPerUser: number,
                                              filename: string, publishDate: Date, dueDate: Date,
                                              reviewPublishDate: Date, reviewDueDate: Date, assignmentId: number, externalLink: string,
                                              reviewEvaluationDueDate?: Date)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "update-assignment-by-id", text:
            "UPDATE assignmentlist " +
            "SET title=$1, description=$2, reviews_per_user=$3, filename=$4, publish_date=$5, due_date=$6, " +
            "review_publish_date=$7, review_due_date=$8, review_evaluation_due_date=$10, external_link=$11 " +
            "WHERE id = $9 RETURNING *"});

        statement.values = [title, description, reviewsPerUser, filename, publishDate, dueDate, reviewPublishDate,
            reviewDueDate, assignmentId, reviewEvaluationDueDate, externalLink];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes an 'get submission by assignment id' query
     * @param {string} netId - net id of the owner of the submission.
     * @param {number} assignmentId - an assignment id.
     * @returns {Promise<pgPromise.queryResult>} all submissions as pg promise.
     */
    public static executeGetSubmissionsByAssignmentId(netId: string, assignmentId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-submissions-by-assignment", text:
            "SELECT s.id, s.user_netid, s.group_id, s.assignment_id, s.file_path, s.date " +
            "FROM submission AS s JOIN groupusers gu ON s.group_id = gu.group_groupid " +
            "WHERE gu.user_netid = $1 AND assignment_id = $2"});
        statement.values = [netId, assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets all groups for a certain assignment
     * @param {number} id - an assignment id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetGroupsByAssignmentId (id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-all-groups-per-assignment", text:
        "SELECT g.id, g.group_name FROM assignmentgroup a JOIN grouplist g ON a.group_id = g.id " +
            "WHERE assignment_id = $1"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Get the users that are in a certain group.
     * @param {number} groupId
     * @return {Promise<pgPromise.queryResult>}
     */
    public static executeGetUsersOfGroup(groupId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-all-groups-users-for-assignment", text:
            "SELECT * from groupusers WHERE group_groupid = $1"});
        statement.values = [groupId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets the group of a user for a specific assignment
     * @param {string} netId
     * @param {number} assignmentId
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetGroupOfNetIdByAssignmentId(netId: string, assignmentId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "get-group-of-netid-by-assignmentid", text:
        "SELECT a.assignment_id, a.group_id " +
            "FROM assignmentgroup a JOIN groupusers g ON a.group_id = g.group_groupid " +
            "WHERE g.user_netid = $1 AND a.assignment_id = $2"});
        statement.values = [netId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks whether this netId already has a group for this assignment
     * @param {string} netId - net id of the user.
     * @param {number} assignmentId - assignment id.
     * @returns {Promise<pgPromise.queryResult>} true or false as pg promise.
     */
    public static executeExistsGroupOfNetIdByAssignmentId(netId: string, assignmentId: number)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "exists-group-netid-assignment-id", text:
        "SELECT EXISTS(SELECT a.assignment_id, a.group_id " +
            "FROM assignmentgroup a JOIN groupusers g ON a.group_id = g.group_groupid " +
            "WHERE g.user_netid = $1 AND a.assignment_id = $2)"});
        statement.values = [netId, assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Checks whether an assignment is specified as one person groups assignment.
     * @param {number} assignmentId - assignment id.
     * @return {Promise<any>} true or false as pg promise.
     */
    public static executeIsOnePersonGroupAssignment(assignmentId: number) {
        const statement = new PreparedStatement({name: "exists-group-netid-assignment-id", text:
            "SELECT one_person_groups FROM assignmentlist WHERE id = $1"});
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Get all enrolled assignments for a user.
     * @param {string} netId - a user net id.
     * @param {number} courseId - a course id.
     * @return {Promise<any>} - all enrolled assignments.
     */
    public static executeGetEnrolledAssignmentsForUser(netId: string, courseId: number) {
        const statement = new PreparedStatement({name: "get-enrolled-assignments-for-netid", text:
            "SELECT al.* " +
            "FROM assignmentlist al " +
            "JOIN assignmentgroup a ON a.assignment_id = al.id " +
            "JOIN groupusers g ON a.group_id = g.group_groupid " +
            "WHERE g.user_netid = $1 AND al.course_id = $2"});
        statement.values = [netId, courseId];
        return Database.executeQuery(statement);
    }

    /**
     * Get all not enrolled assignments for a user.
     * @param {string} netId - a user net id.
     * @param {number} courseId - a course id.
     * @return {Promise<any>} - all not enrolled assignments.
     */
    public static executeGetUnenrolledAssignmentsForUser(netId: string, courseId: number) {
        const statement = new PreparedStatement({name: "get-not-enrolled-assignments-for-netid", text:
            "SELECT * FROM assignmentlist " +
            "WHERE course_id = $1 AND id NOT IN (SELECT al.id FROM assignmentlist al " +
            "JOIN assignmentgroup a ON a.assignment_id = al.id " +
            "JOIN groupusers g ON a.group_id = g.group_groupid " +
            "WHERE g.user_netid = $2 AND al.course_id = $1) " +
            "AND assignmentlist.one_person_groups = true " +
            "AND assignmentlist.publish_date < CURRENT_TIMESTAMP " +
            "AND assignmentlist.due_date > CURRENT_TIMESTAMP"});
        statement.values = [courseId, netId];
        return Database.executeQuery(statement);
    }
}