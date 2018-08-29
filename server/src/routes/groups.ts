import GroupsPS from "../prepared_statements/group_ps";
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
        await GroupsPS.executeDeleteGroupMember(req.params.id, req.params.userNetID);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
 });

export default router;