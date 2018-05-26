import GroupsPS from "../prepared_statements/group_ps";
// Router
import { Router } from "express";
const router = Router();

/**
 * Route to get all the groups
 */
router.get("/", async (req: any, res) => {
    res.json(await GroupsPS.executeGetGroups());
 });

/**
 * Route to get a group with a specific id
 */
router.get("/:id", async (req: any, res) => {
    res.json(await GroupsPS.executeGetGroupById(req.params.id));
 });

/**
 * Route to get he users of a group with a specific id
 */
router.get("/:id/users", async (req: any, res) => {
    res.json(await GroupsPS.executeGetUsersOfGroupById(req.params.id));
 });

export default router;