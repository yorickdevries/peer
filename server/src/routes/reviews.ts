import ReviewPS from "../prepared_statements/review_ps";

// Router
import { Router } from "express";
const router = Router();

/**
 * Route that creates a new review
 * @body comment - comment
 * @body user_netId - user_netId
 * @body submission_id - submission_id
 * @body rubric_id - rubric_id
 */
router.post("/peer-reviews", async (req, res) => {
    res.json(await ReviewPS.executeCreateReview(req.body.comment, req.body.user_netid, req.body.submission_id));
});

export default router;