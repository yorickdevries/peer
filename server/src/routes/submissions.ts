// Imports
import SubmissionsPS from "../prepared_statements/submissions_ps";

// Router
import { Router } from "express";
const router = Router();

/**
 * Route to get all submissions.
 */
router.get("/", async (req, res) => {
    res.json(await SubmissionsPS.executeGetSubmissions());
});

/**
 * Route to get one submission with a specific id.
 * @param id - submission id.
 */
router.get("/:id", async (req, res) => {
    res.json(await SubmissionsPS.executeGetSubmissionById(req.params.id));
});

/**
 * Route to get one submission with a specific id.
 * @param id - submission id.
 */
router.get("/:id", async (req, res) => {
    res.json(await SubmissionsPS.executeGetSubmissionById(req.params.id));
});

/**
 * Route to delete one submission with a specific id.
 * @param id - submission id.
 */
router.delete("/:id", async (req, res) => {
    res.json(await SubmissionsPS.executeDeleteSubmissionById(req.params.id));
});

/**
 * Route to make a new submission.
 */
router.post("/", async (req: any, res) => {
    // make path here
    res.json(await SubmissionsPS.executeCreateSubmission(req.userinfo.given_name, req.body.assignmentId, "dummypath"));
});

export default router;