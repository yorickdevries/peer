import GroupsPS from "../prepared_statements/group_ps";
import bodyParser from "body-parser";
import index from "../security/index";


// Router
import express from "express";
const router = express();
router.use(bodyParser.json());


/**
 * Route to get a group with a specific id
 */
router.route("/:id").get(index.authorization.isAuthorizedToViewGroup, async (req: any, res) => {
    res.json(await GroupsPS.executeGetGroupById(req.params.id));
 });

/**
 * Route to get he users of a group with a specific id
 */
router.route("/:id/users").get(index.authorization.isAuthorizedToViewGroup, async (req: any, res) => {
    res.json(await GroupsPS.executeGetUsersOfGroupById(req.params.id));
 });

export default router;