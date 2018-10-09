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
        const statement = new PreparedStatement("get-result-aggregation-assignment",
            'SELECT netID AS "netID", studentNumber AS "studentnumber", approved, disproved, total - approved - disproved AS "waiting for TA", total AS "student total reviews", assignmentTitle AS "assignment", courseTitle AS "course"\n' +
            "            FROM (\n" +
            "                SELECT userlist.netid AS netID,\n" +
            "                userlist.studentNumber AS studentNumber,\n" +
            "                SUM(CASE WHEN review.approved IN (true) THEN 1 ELSE 0 END) AS approved,\n" +
            "                SUM(CASE WHEN review.approved IN (false) THEN 1 ELSE 0 END) AS disproved,\n" +
            "                COUNT(userlist.netid) AS total,\n" +
            "                assignmentlist.title AS assignmentTitle,\n" +
            "                courselist.name AS coursetitle\n" +
            "                FROM userlist \n" +
            "                JOIN review ON review.user_netid = userlist.netid\n" +
            "                JOIN assignmentlist ON review.rubric_assignment_id = assignmentlist.id\n" +
            "                JOIN courselist ON assignmentlist.course_id = courselist.id\n" +
            "                WHERE review.rubric_assignment_id = $1 AND review.done = TRUE\n" +
            "                GROUP BY userlist.netid, assignmentlist.title, courselist.name\n" +
            "            ) AS aggregations\n");
        statement.values = [assignmentId];
        return Database.executeQuery(statement);
    }

    /**
     * Get an export file about the review stats of a student for a specific course.
     * @return {any} - CSV file with columns: net id, approval/disapproval rate of their reviews, pending TA reviews
     * and total amount of reviews by the student.
     */
    public static executeGetStudentReviewExportCourse(courseId: number): any {
        const statement = new PreparedStatement("get-result-aggregation-course",
            'SELECT netID AS "netID", studentNumber AS "studentnumber", approved, disproved, total - approved - disproved AS "waiting for TA", total AS "student total reviews", assignmentTitle AS "assignment", courseTitle AS "course"' +
            "FROM (" +
            "    SELECT userlist.netid AS netID," +
            "    userlist.studentNumber AS studentNumber," +
            "    SUM(CASE WHEN review.approved IN (true) THEN 1 ELSE 0 END) AS approved," +
            "    SUM(CASE WHEN review.approved IN (false) THEN 1 ELSE 0 END) AS disproved," +
            "    COUNT(userlist.netid) AS total," +
            "    assignmentlist.title AS assignmentTitle," +
            "    courselist.name AS coursetitle" +
            "    FROM userlist " +
            "    JOIN review ON review.user_netid = userlist.netid" +
            "    JOIN assignmentlist ON review.rubric_assignment_id = assignmentlist.id" +
            "    JOIN courselist ON assignmentlist.course_id = courselist.id" +
            "    WHERE review.done = TRUE AND assignmentlist.course_id = $1" +
            "    GROUP BY userlist.netid, assignmentlist.title, courselist.name" +
            ") AS aggregations");
        statement.values = [courseId];
        return Database.executeQuery(statement);
    }


}