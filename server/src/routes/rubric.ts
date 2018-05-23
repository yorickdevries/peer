import RubricPS, {default as rubricPS} from "../prepared_statements/rubric_ps"

// Router
import { Router } from "express";
const router = Router();

export default router;

router.post("/mcoption", async (req, res) => {
    res.json(RubricPS.executeCreateMCOption(req.body.option, req.body.mcquestion_id));
});

router.put("/mcoption/:option_id", async (req, res) => {
    res.json(RubricPS.executeUpdateMCOption(req.body.option, req.body.mcquestion_id, req.params.option_id));
});

router.post("/mcquestion", async (req, res) => {
    res.json(RubricPS.executeCreateMCQuestion(req.body.question, req.body.rubric_id, req.body.question_number));
});

router.put("/openquestion/:question_id", async (req, res) => {
    res.json(rubricPS.executeUpdateMCQuestion(req.body.question, req.body.rubric_id, req.body.question.number, req.params.question_id));
});


router.post("/rangequestion", async (req, res) => {
    res.json(RubricPS.executeCreateRangeQuestion(req.body.question, req.body.range, req.body.rubric_id, req.body.question_number));
});

router.put("/rangequestion/:question_id", async (req, res) => {
    res.json(rubricPS.executeUpdateRangeQuestion(req.body.question, req.body.range, req.body.rubric_id, req.body.question.number, req.params.question_id));
});


router.post("/openquestion", async (req, res) => {
    res.json(RubricPS.executeCreateOpenQuestion(req.body.question, req.body.rubric_id, req.body.question_number));
});

router.put("/openquestion/:question_id", async (req, res) => {
    res.json(rubricPS.executeUpdateOpenQuestion(req.body.question, req.body.rubric_id, req.body.question.number, req.params.question_id));
});

/**
 * Router to make a rubric
 * @body rubric_id
 */
router.post("/", async (req, res) => {
    res.json(RubricPS.executeCreateRubric(req.body.rubric_id));
});
