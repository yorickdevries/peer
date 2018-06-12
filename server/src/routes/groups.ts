import GroupsPS from "../prepared_statements/group_ps";
import bodyParser from "body-parser";

// Router
import express from "express";
const router = express();
router.use(bodyParser.json());

/**
 * Route to get all the groups
 */
router.get("/", (req: any, res) => {
    GroupsPS.executeGetGroups()
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
 });

/**
 * Route to get a group with a specific id
 */
router.get("/:id", (req: any, res) => {
    GroupsPS.executeGetGroupById(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
 });

/**
 * Route to get he users of a group with a specific id
 */
router.get("/:id/users", (req: any, res) => {
    GroupsPS.executeGetUsersOfGroupById(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
 });

export default router;