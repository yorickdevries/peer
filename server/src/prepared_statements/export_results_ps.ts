import Database from "../database";
import { PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for courses.
 */
export default class ExportResultsPS {

    /**
     * Get an export file about the review stats of a student for a specific assignment.
     * @return {any} - CSV file with columns: net id, approval/disapproval rate of their reviews, pending TA reviews
     * and total amount of reviews by the student.
     */
    public static executeGetStudentSubmissionReviewExportAssignment(assignmentId: number): any {
        const statement = new PreparedStatement({name: "get-result-aggregation-assignment", text:
            'SELECT netID AS "netID", studentNumber AS "studentnumber", approved, disapproved, total - approved - disapproved AS "waiting for TA", total AS "student total reviews", flagged' +
            " FROM (" +
            "    SELECT userlist.netid AS netID," +
            "    userlist.studentNumber AS studentNumber," +
            "    SUM(CASE WHEN review.approved IN (true) THEN 1 ELSE 0 END) AS approved," +
            "    SUM(CASE WHEN review.approved IN (false) THEN 1 ELSE 0 END) AS disapproved," +
            "    SUM(CASE WHEN review.flagged IN (true) THEN 1 ELSE 0 END) AS flagged," +
            "    COUNT(userlist.netid) AS total" +
            "    FROM userlist " +
            "    JOIN review ON review.user_netid = userlist.netid" +
            "    JOIN rubric ON review.rubric_id = rubric.id" +
            "    WHERE rubric.assignment_id = $1 AND review.done = TRUE" +
            "    AND rubric.type = 'submission'" +
            "    GROUP BY userlist.netid" +
            ") AS aggregations"});
        statement.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Get an export file about the review stats of a student for a specific course.
     * @return {any} - CSV file with columns: net id, approval/disapproval rate of their reviews, pending TA reviews
     * and total amount of reviews by the student.
     */
    public static executeGetStudentSubmissionReviewExportCourse(courseId: number): any {
        const statement = new PreparedStatement({name: "get-result-aggregation-course", text:
            'SELECT netID AS "netID", studentNumber AS "studentnumber", approved, disapproved, total - approved - disapproved AS "waiting for TA", total AS "student total reviews", flagged' +
            " FROM (" +
            "    SELECT userlist.netid AS netID," +
            "    userlist.studentNumber AS studentNumber," +
            "    SUM(CASE WHEN review.approved IN (true) THEN 1 ELSE 0 END) AS approved," +
            "    SUM(CASE WHEN review.approved IN (false) THEN 1 ELSE 0 END) AS disapproved," +
            "    SUM(CASE WHEN review.flagged IN (true) THEN 1 ELSE 0 END) AS flagged," +
            "    COUNT(userlist.netid) AS total" +
            "    FROM userlist " +
            "    JOIN review ON review.user_netid = userlist.netid" +
            "    JOIN rubric ON review.rubric_id = rubric.id" +
            "    JOIN assignmentlist ON rubric.assignment_id = assignmentlist.id" +
            "    WHERE review.done = TRUE AND assignmentlist.course_id = $1" +
            "    AND rubric.type = 'submission'" +
            "    GROUP BY userlist.netid" +
            ") AS aggregations"});
        statement.values = [courseId];
        return Database.executeQuery(statement);
    }


}