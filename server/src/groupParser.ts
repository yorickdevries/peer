import neatCsv from "neat-csv";
import GroupPS from "./prepared_statements/group_ps";
import UserPS from "./prepared_statements/user_ps";
import AssignmentPS from "./prepared_statements/assignment_ps";
import CoursesPS from "./prepared_statements/courses_ps";
/**
 * Enables parsing of Group files in CSV format.
 *
 * @export
 * @class GroupParser
 */
export default class GroupParser {
    /**
     * Parses the group data into the database
     */
    public static async importGroups(filebuffer: Buffer, groupColumn: string, assignmentId: number) {
        // parse the file
        const studentlist = await neatCsv(filebuffer);
        await this.checkStudentList(studentlist, assignmentId);
        const studentmap = this.mapGroups(studentlist, groupColumn);
        const groupnames = await this.addGroupsToDatabase(studentmap, assignmentId);
        return groupnames;
    }
    /**
     * Checks whether the studentlist is valid;
     * Checks whether there are duplicate students in this file
     * or whether a student already has a group for this assignment.
     * Makes sure the student always has at most one group for an assignment.
     *
     * @static
     * @param {any[]} studentlist
     * @param {number} assignmentId
     * @memberof GroupParser
     */
    public static async checkStudentList(studentlist: any[], assignmentId: number) {
        const allStudents: string[] = [];
        for (const student of studentlist) {
            const currentStudent = student.Username;
            // in case the student doesnt have a Username field
            if (currentStudent == undefined) {
                throw new Error("The file is improperly formatted");
            }
            // in case the student doesnt have a Username field
            if (currentStudent == "") {
                throw new Error("One student has no username");
            }
            const netId = currentStudent.split("@")[0].toLowerCase();
            if (allStudents.indexOf(netId) >= 0) {
                throw new Error("Duplicate student: " + netId);
            }
            // check whether the student is already in a group for this assignment
            // should error as no group exists yet
            const groupAssignment: any = await AssignmentPS.executeExistsGroupOfNetIdByAssignmentId(netId, assignmentId);
            if (groupAssignment.exists) {
                throw new Error(netId + " is already in a group");
            } else {
                // Add student to list
                allStudents.push(netId);
            }
        }
    }

    /**
     * Checks whether an assignment exists
     *
     * @static
     * @param {number} assignmentId
     * @returns
     * @memberof GroupParser
     */
    public static async assignmentExists(assignmentId: number) {
        const res: any = await AssignmentPS.executeExistsAssignmentById(assignmentId);
        return res.exists;
    }

    /**
     * Creates a student when the student doesn't exist.
     *
     * @static
     * @param {string} netId
     * @returns
     * @memberof GroupParser
     */
    public static async createStudentIfNotExists(netId: string) {
        const res: any = await UserPS.executeExistsUserById(netId);
        // In case there is no student entry yet in the database, make one
        if (!res.exists) {
            // The email is not known while creating this student entry
            // Creating user
            const newUser = await UserPS.executeAddUser(netId, undefined);
        }
        return;
    }

    /**
     * Enrolls a student if not already enrolled.
     *
     * @static
     * @param {number} courseId
     * @param {string} netId
     * @returns
     * @memberof GroupParser
     */
    public static async enrollStudentIfNotEnrolled(courseId: number, netId: string) {
        const res: any = await CoursesPS.executeExistsEnrolledByCourseIdUserById(courseId, netId);
        // In case there is no student entry yet in the database, make one
        if (!res.exists) {
            // enrolling user
            const newUser = await CoursesPS.executeEnrollInCourseId(courseId, netId, "student");
        }
        return;
    }

    /**
     * Maps the groups to the students
     *
     * @static
     * @param {object[]} studentlist
     * @param {string} groupColumn
     * @returns {Map<string, string[]>}
     * @memberof GroupParser
     */
    public static mapGroups(studentlist: object[], groupColumn: string): Map<string, string[]> {
        // initialize result map
        const result: Map<string, string[]> = new Map<string, string[]>();
        // iterate over all students
        studentlist.forEach(function(student: any) {
            const currentStudent = student.Username;
            const currentGroup = student[groupColumn];
            // in case the student doesnt have a groupColumn field
            if (currentGroup == undefined || currentGroup == "") {
                throw new Error(currentStudent + " does not have a group");
            }
            // fill the map
            const currentStudentList = result.get(currentGroup);
            // In case there is already a list in the map
            if (currentStudentList !== undefined) {
                // add username without @ adress
                const netid = currentStudent.split("@")[0].toLowerCase();
                currentStudentList.push(netid);
            } else {
                // initialize list with this student
                const netid = currentStudent.split("@")[0].toLowerCase();
                result.set(student[groupColumn], [netid]);
            }
        });
        return result;
    }

    /**
     * Puts the groups into the database
     *
     * @static
     * @param {Map<string, string[]>} studentmap
     * @param {number} assignmentId
     * @returns
     * @memberof GroupParser
     */
    public static async addGroupsToDatabase(studentmap: Map<string, string[]>, assignmentId: number) {
        const assignmentExists = await this.assignmentExists(assignmentId);
        if (!assignmentExists) {
            throw new Error("Assignment doesn't exist in the database");
        }
        // get assignment info
        const assignment: any = await AssignmentPS.executeGetAssignmentById(assignmentId);
        // get course_Id
        const courseId = assignment.course_id;
        // Get a list of all groups
        const groupnames = studentmap.keys();
        const importedGroups = [];
        // Iterate over all groups
        for (const groupname of groupnames) {
            // Get a list of all students in this group
            const students = studentmap.get(groupname);
            if (students !== undefined) {
                // make an group entry in the database
                const group: any = await GroupPS.executeAddGroup(groupname);
                // add an assignment to the group
                const groupId = group.id;
                await GroupPS.executeAddGrouptoAssignment(groupId, assignmentId);
                // add all students to a group
                for (const studentNetId of students) {
                    // Check whether student doesnt have a group yet
                    const groupAssignment: any = await AssignmentPS.executeExistsGroupOfNetIdByAssignmentId(studentNetId, assignmentId);
                    if (groupAssignment.exists) {
                        throw new Error(studentNetId + " is already in a group");
                    }
                    // create student in database
                    await this.createStudentIfNotExists(studentNetId);
                    // Enroll student in course
                    await this.enrollStudentIfNotEnrolled(courseId, studentNetId);
                    // add student to a group
                    await GroupPS.executeAddStudenttoGroup(studentNetId, groupId);
                }
                importedGroups.push({groupId: groupId, groupname: groupname});
            }
        }
    // return a list of the groups made
    return importedGroups;
    }
}