import GroupsPS from "../prepared_statements/group_ps";
import UserPS from "../prepared_statements/user_ps";
import GroupParser from "../groupParser";
import index from "../security/index";


// Router
import express from "express";
import AssignmentPS from "../prepared_statements/assignment_ps";
import SubmissionsPS from "../prepared_statements/submissions_ps";
import ParseNetId from "../parseNetId";
const router = express();
// Needed for the tests (tests need to change)
router.use(express.json());


/**
 * Route to get a group with a specific id.
 */
router.get("/:id", index.authorization.isAuthorizedToViewGroup, (req: any, res) => {
    GroupsPS.executeGetGroupById(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch(() => {
        res.sendStatus(400);
    });
 });

/**
 * Route to get the users of a group with a specific id.
 */
router.get("/:id/users", index.authorization.isAuthorizedToViewGroup, (req: any, res) => {
    GroupsPS.executeGetUsersOfGroupById(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch(() => {
        res.sendStatus(400);
    });
 });

/**
 * Route to delete a group.
 */
router.delete("/:id", index.authorization.isAuthorizedToEditGroup, async (req: any, res) => {
    try {
        const groupId = req.params.id;

        // check users
        const groupUsers: any = await GroupsPS.executeGetUsersOfGroupById(groupId);
        if (groupUsers.length != 0) {
            throw new Error("There are still users in this group");
        }
        // check submissions
        const assignmentGroup = await GroupsPS.executeGetAssignmentOfGroupById(groupId);
        const assignmentId = assignmentGroup.assignment_id;
        const submissions: any = await SubmissionsPS.executeGetAllSubmissionByAssignmentIdByGroupId(assignmentId, groupId);
        if (submissions.length != 0) {
            throw new Error("This group already made a submission");
        }

        // Otherwise, remove the group from the assignment and the group itself
        await GroupsPS.executeDeleteGroupfromAssignment(groupId, assignmentId);
        await GroupsPS.executeDeleteGroup(req.params.id);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.status(400);
        res.json({error: e.message});
    }
 });

/**
 * Route to delete a group member.
 */
router.delete("/:id/users/:userNetID", index.authorization.isAuthorizedToEditGroup, async (req: any, res) => {
    try {
        const netid = ParseNetId.parseNetId(req.params.userNetID);
        await GroupsPS.executeDeleteGroupMember(req.params.id, netid);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
 });

/**
 * Route to post a group member.
 * @body assignmentId - the current assignment id.
 * @param id - the group id.
 */
router.post("/:id/users", index.authorization.isAuthorizedToEditGroup, async (req: any, res) => {
    try {
        const netid = ParseNetId.parseNetId(req.body.user_netid);
        if (netid.length == 0) {
            throw new Error("NetID is empty");
        }
        const assignment: any = await AssignmentPS.executeGetAssignmentById(req.body.assignmentId);
        const courseid = assignment.course_id;

        // Check if the student already is in a group.
        if (await GroupParser.studentIsInGroup(netid, req.body.assignmentId)) {
            res.status(400);
            res.json({error: netid + " is already in a group"});
            return;
        }

        // check whether user is in the database and add if not existing.
        const userExists: any = await UserPS.executeExistsUserById(netid);
        if (!userExists.exists) {
            await UserPS.executeAddUser(netid);
        }

        // Enroll student in course
        await GroupParser.enrollStudentIfNotEnrolled(courseid, netid);

        await GroupsPS.executeAddStudenttoGroup(netid, req.params.id);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.status(400);
        res.json({error: e.message});
    }
 });

export default router;