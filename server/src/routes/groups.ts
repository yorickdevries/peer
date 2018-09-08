import GroupsPS from "../prepared_statements/group_ps";
import UserPS from "../prepared_statements/user_ps";
import bodyParser from "body-parser";
import index from "../security/index";


// Router
import express from "express";
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
 */
router.post("/:id/users", index.authorization.isAuthorizedToEditGroup, async (req: any, res) => {
    try {
        const netid = req.body.userNetID.toLowerCase();
        // check whether user is in the database
        const userExists: any = await UserPS.executeExistsUserById(netid);
        if (!userExists.exists) {
            // Adding user
            await UserPS.executeAddUser(netid);
        }
        await GroupsPS.executeAddStudenttoGroup(netid, req.params.id);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
 });

export default router;