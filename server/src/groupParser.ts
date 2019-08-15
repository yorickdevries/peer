import neatCsv from "neat-csv";
import GroupPS from "./prepared_statements/group_ps";
import UserPS from "./prepared_statements/user_ps";
import AssignmentPS from "./prepared_statements/assignment_ps";
import CoursesPS from "./prepared_statements/courses_ps";
import ParseNetId from "./parseNetId";

/**
 * Enables parsing of Group files in CSV format.
 */
export default class GroupParser {

    /**
     * Parses the group data into the database
     * @param {Buffer} filebuffer
     * @param {string} groupColumn
     * @param {number} assignmentId
     * @return {Promise<any[]>}
     */
    public static async importGroups(filebuffer: Buffer, groupColumn: string, assignmentId: number) {
        // parse the file
        let studentlist = await neatCsv(filebuffer);
        studentlist = await this.checkStudentList(studentlist, assignmentId);
        const studentmap = this.mapGroups(studentlist, groupColumn);
        return await this.addGroupsToDatabase(studentmap, assignmentId);
    }

    /**
     * Checks if a group is empty.
     * @param csvEntry - an entry of the brightspace csv export.
     * @return {boolean} - true if the group is empty.
     */
    public static isEmptyGroup(csvEntry: any): boolean {
        const studentNumber = csvEntry["OrgDefinedId"];
        const netId = csvEntry.Username;
        const lastName = csvEntry["Last Name"];
        const firstName = csvEntry["First Name"];
        const email = csvEntry["Email"];
        return studentNumber === "" && netId === "" && netId === "" && lastName === "" && firstName === "" && email === "";
    }

    /**
     * Checks whether the studentlist is valid;
     * Checks whether there are duplicate students in this file
     * or whether a student already has a group for this assignment.
     * Makes sure the student always has at most one group for an assignment.
     * @param {any[]} studentlist
     * @param {number} assignmentId
     * @return {Promise<void>}
     */
    public static async checkStudentList(studentlist: any[], assignmentId: number) {
        const allStudents: string[] = [];
        const validStudents: string[] = [];
        for (const student of studentlist) {
            // Skip empty groups
            if (this.isEmptyGroup(student)) {
                continue;
            }
            const currentStudent = student.Username;
            const netId = ParseNetId.parseNetId(currentStudent);

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
                validStudents.push(student);
            }
        }

        return validStudents;
    }

    /**
     * Checks whether an assignment exists
     * @param {number} assignmentId
     * @returns true if the file exists.
     */
    public static async assignmentExists(assignmentId: number) {
        const res: any = await AssignmentPS.executeExistsAssignmentById(assignmentId);
        return res.exists;
    }

    /**
     * Creates a student when the student doesn't exist.
     * @param {string} netId
     * @return {Promise<void>}
     */
    public static async createStudentIfNotExists(netId: string) {
        const res: any = await UserPS.executeExistsUserById(netId);
        // In case there is no student entry yet in the database, make one
        if (!res.exists) {
            // The email is not known while creating this student entry
            // Creating user
            await UserPS.executeAddUser(netId);
        }
        return;
    }

    /**
     * Enrolls a student if not already enrolled.
     * @param {number} courseId
     * @param {string} netId
     * @return {Promise<void>}
     */
    public static async enrollStudentIfNotEnrolled(courseId: number, netId: string) {
        const res: any = await CoursesPS.executeExistsEnrolledByCourseIdUserById(courseId, netId);
        // In case there is no student entry yet in the database, make one
        if (!res.exists) {
            // enrolling user
            await CoursesPS.executeEnrollInCourseId(courseId, netId, "student");
        }
        return;
    }

    /**
     * Maps the groups to the students
     * @param {object[]} studentlist
     * @param {string} groupColumn
     * @returns {Map<string, string[]>} mapping of the groups.
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
                const netid = ParseNetId.parseNetId(currentStudent);
                currentStudentList.push(netid);
            } else {
                // initialize list with this student
                const netid = ParseNetId.parseNetId(currentStudent);
                result.set(student[groupColumn], [netid]);
            }
        });
        return result;
    }

    /**
     * Create a group and add an assignment to that group.
     * @param {string} groupname - a group name.
     * @param {number} assignmentId - an existing assignment id.
     * @return {Promise<any>} the group id.
     */
    public static async createGroupForAssignment(groupname: string, assignmentId: number) {
        // make an group entry in the database
        const group: any = await GroupPS.executeAddGroup(groupname);
        // add an assignment to the group
        const groupId = group.id;
        await GroupPS.executeAddGrouptoAssignment(groupId, assignmentId);

        return groupId;
    }

    /**
     * Check wheter a student is in a specific group.
     * @param {string} studentNetId - student net id.
     * @param {number} assignmentId - assignment id.
     * @return {Promise<any>} true if already in a group.
     */
    public static async studentIsInGroup(studentNetId: string, assignmentId: number) {
        const groupAssignment: any = await AssignmentPS.executeExistsGroupOfNetIdByAssignmentId(studentNetId, assignmentId);
        return (groupAssignment.exists);
    }

    /**
     * Puts the groups into the database
     * @param {Map<string, string[]>} studentmap
     * @param {number} assignmentId
     * @returns list of the groups that are made.
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
                const groupId = await this.createGroupForAssignment(groupname, assignmentId);
                // add all students to a group
                for (const studentNetId of students) {
                    if (await this.studentIsInGroup(studentNetId, assignmentId)) {
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