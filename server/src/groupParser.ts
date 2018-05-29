import neatCsv from "neat-csv";
import GroupPS from "./prepared_statements/group_ps";
import UserPS from "./prepared_statements/user_ps";
import AssignmentPS from "./prepared_statements/assignment_ps";
import CoursesPS from "./prepared_statements/courses_ps";

export default class GroupParser {
    /**
     * Parses the group data into the database
     */
    public static async importGroups(filebuffer: Buffer, groupColumn: string, assignmentId: number) {
        // parse the file
        try {
            const studentlist = await neatCsv(filebuffer);
            const studentmap = this.mapGroups(studentlist, groupColumn);
            const groupnames = await this.addGroupsToDatabase(studentmap, assignmentId);
            return groupnames;
        } catch (err) {
            return {error: err.message};
        }
    }

    // this function checks whether an assignment exists
    public static async assignmentExists(assignmentId: number) {
        const res: any = await AssignmentPS.executeCountAssignmentById(assignmentId);
        if (res.error || res.count == 0) {
            return false;
        } else {
            return true;
        }
    }

    // this function creates a student when the student doesnt exist
    public static async createStudentIfNotExists(netId: string) {
        const res: any = await UserPS.executeCountUserById(netId);
        // In case there is no student entry yet in the database, make one
        if (res.error || res.count == 0) {
            // The email is not known while creating this student entry
            const newUser = await UserPS.executeAddUser(netId, undefined);
            console.log("creating user: " + JSON.stringify(newUser));
        }
        return;
    }

    // this function enrolls a student if not already enrolled
    public static async enrollStudentIfNotEnrolled(courseId: number, netId: string) {
        const res: any = await CoursesPS.executeCountUserByCourseId(courseId, netId);
        // In case there is no student entry yet in the database, make one
        if (res.error || res.count == 0) {
            const newUser = await CoursesPS.executeEnrollInCourseId(courseId, netId, "student");
            console.log("enrolled user: " + JSON.stringify(newUser) + " in course " + courseId);
        }
        return;
    }

    // this function maps the groups to the students
    public static mapGroups(studentlist: object[], groupColumn: string): Map<string, string[]> {
        // initialize result map
        const result: Map<string, string[]> = new Map<string, string[]>();
        // iterate over all students
        studentlist.forEach(function(student: any) {
            const currentStudent = student.Username;
            // in case the student doesnt have a Username field
            if (currentStudent == undefined) {
                throw new Error("The file is improperly formatted");
            }
            // in case the student doesnt have a Username field
            if (currentStudent == "") {
                throw new Error("One student has no username");
            }
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
                const netid = currentStudent.split("@")[0];
                currentStudentList.push(netid);
            } else {
                // initialize list with this student
                const netid = currentStudent.split("@")[0];
                result.set(student[groupColumn], [netid]);
            }
        });
        return result;
    }

    // Puts the groups into the database
    public static async addGroupsToDatabase(studentmap: Map<string, string[]>, assignmentId: number) {
        if (!await this.assignmentExists(assignmentId)) {
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