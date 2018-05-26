import neatCsv from "neat-csv";
import GroupPS from "./prepared_statements/group_ps";
import UserPS from "./prepared_statements/user_ps";

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
            return {error: err};
        }
    }

    // this function maps the groups to the students
    public static mapGroups(studentlist: object[], groupColumn: string): Map<string, string[]> {
        // initialize result map
        const result: Map<string, string[]> = new Map<string, string[]>();
        // iterate over all students
        studentlist.forEach(function(student: any) {
            const currentGroup = student[groupColumn];
            // in case the student doesnt have a groupColumn field
            if (currentGroup == undefined) {
                throw new Error("student does not have a group");
            }
            // fill the map
            const currentStudentList = result.get(currentGroup);
            // In case there is already a list in the map
            if (currentStudentList !== undefined) {
                // add username without @ adress
                const netid = student.Username.split("@")[0];
                currentStudentList.push(netid);
            } else {
                // initialize list with this student
                const netid = student.Username.split("@")[0];
                result.set(student[groupColumn], [netid]);
            }
        });
        return result;
    }

    // Puts the groups into the database
    public static async addGroupsToDatabase(studentmap: Map<string, string[]>, assignmentId: number) {
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
                const groupAssignment = await GroupPS.executeAddGrouptoAssignment(groupId, assignmentId);
                // add all students to a group
                for (const student of students) {
                    const studentEntry: any = await UserPS.executeGetUserById(student);
                    // In case there is no student entry yet in the database, make one
                    if (studentEntry.error) {
                        // The email is not known while creating this student entry
                        const result = await UserPS.executeAddUser(student, undefined);
                    }
                    // add student to a group
                    await GroupPS.executeAddStudenttoGroup(student, groupId);
                }
                importedGroups.push({groupId: groupId, groupname: groupname});
            }
        }
    // return a list of the groups made
    return importedGroups;
    }
}