import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for courses.
 */
export default class ExportResultsPS {

    /**
     * Get an export file about the review stats of a student for a specific assignment.
     * @return {any} - CSV file with columns: net id, approval/disapproval rate of their reviews, pending TA reviews
     * and total amount of reviews by the student.
     */
    public static executeGetStudentReviewExportAssignment(assignmentId: number): any {
        const statement = new PreparedStatement("get-result-aggregation",
            'SELECT netID AS "netID", approved, disproved, total - approved - disproved AS "waiting for TA", total AS "student total reviews"' +
            "FROM (" +
            "    SELECT userlist.netid AS netID," +
            "    SUM(CASE WHEN review.approved IN (true) THEN 1 ELSE 0 END) AS approved," +
            "    SUM(CASE WHEN review.approved IN (false) THEN 1 ELSE 0 END) AS disproved," +
            "    COUNT(userlist.netid) AS total" +
            "    FROM userlist " +
            "    JOIN review ON review.user_netid = userlist.netid" +
            "    WHERE review.rubric_assignment_id = $1 AND review.done = TRUE" +
            "    GROUP BY userlist.netid" +
            ") AS aggregations");
        statement.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Get an export file about the review stats of a student for a specific course.
     * @return {any} - CSV file with columns: net id, approval/disapproval rate of their reviews, pending TA reviews
     * and total amount of reviews by the student.
     */
    public static executeGetStudentReviewExportCourse(courseId: number): any {
        const statement = new PreparedStatement("get-result-aggregation",
            '﻿SELECT netID AS "netID", approved, disapproved, total - approved - disproved AS "waiting for TA", total AS "student total reviews"' +
            "FROM (" +
            "    SELECT userlist.netid AS netID," +
            "    SUM(CASE WHEN review.approved IN (true) THEN 1 ELSE 0 END) AS approved," +
            "    SUM(CASE WHEN review.approved IN (false) THEN 1 ELSE 0 END) AS disproved," +
            "    COUNT(userlist.netid) AS total" +
            "    FROM userlist " +
            "    JOIN review ON review.user_netid = userlist.netid" +
            "    JOIN assignmentlist ON review.rubric_assignment_id = assignmentlist.id" +
            "    WHERE review.done = TRUE AND assignmentlist.course_id = 2" +
            "    GROUP BY userlist.netid" +
            ") AS aggregations");
        statement.values = [courseId];
        return Database.executeQuery(statement);
    }


}