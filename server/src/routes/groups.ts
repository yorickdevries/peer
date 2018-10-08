import GroupsPS from "../prepared_statements/group_ps";
import UserPS from "../prepared_statements/user_ps";
import GroupParser from "../groupParser";
import bodyParser from "body-parser";
import index from "../security/index";


// Router
import express from "express";
import AssignmentPS from "../prepared_statements/assignment_ps";
const router = express();
router.use(bodyParser.json());


/**
 * Route to get a group with a specific id.
 */
router.get("/:id", index.authorization.isAuthorizedToViewGroup, (req: any, res) => {
    GroupsPS.executeGetGroupById(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
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
    }).catch((error) => {
        res.sendStatus(400);
    });
 });

/**
 * Route to delete a group.
 */
router.delete("/:id", index.authorization.isAuthorizedToEditGroup, async (req: any, res) => {
    try {
        await GroupsPS.executeDeleteGroup(req.params.id);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
 });

/**
 * Route to delete a group member.
 */
router.delete("/:id/users/:userNetID", index.authorization.isAuthorizedToEditGroup, async (req: any, res) => {
    try {
        const netid = req.params.userNetID.toLowerCase();
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
        const netid = req.body.user_netid.toLowerCase();
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
        res.sendStatus(400);
    }
 });

export default router;