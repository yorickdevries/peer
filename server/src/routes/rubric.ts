import RubricPS, { default as rubricPS } from "../prepared_statements/rubric_ps";

// Router
import { Router } from "express";
const router = Router();

export default router;

/**
 * Route to delete an open question
 * @params id - id
 */
router.delete("/openquestion/:id", async (req, res) => {
    res.json(await RubricPS.executeDeleteOpenQuestion(req.params.id));
});

/**
 * Route to delete a range question
 * @params id - id
 */
router.delete("/rangequestion/:id", async (req, res) => {
    res.json(await RubricPS.executeDeleteRangeQuestion(req.params.id));
});

/**
 * Route to delete mc question
 * @params id - id
 */
router.delete("/mcquestion/:id", async (req, res) => {
    res.json(await RubricPS.executeDeleteMCQuestion(req.params.id));
});

/**
 * Route to delete mc option
 * @params id - id
 */
router.delete("/mcoption/:id", async (req, res) => {
    res.json(await RubricPS.executeDeleteMCOption(req.params.id));
});

/**
 * Route to create an option for a multiple choice question
 * @body option, mcquestion_id
 */
router.post("/mcoption", async (req, res) => {
    res.json(await RubricPS.executeCreateMCOption(req.body.option, req.body.mcquestion_id));
});

/**
 * Route to update mcoption
 *
 */
router.put("/mcoption/:option_id", async (req, res) => {
    res.json(await RubricPS.executeUpdateMCOption(req.body.option, req.body.mcquestion_id, req.params.option_id));
});

/**
 * create mcquestion
 * @body question - question
 * @body question_number - question_number
 */
router.post("/mcquestion", async (req, res) => {
        res.json(await RubricPS.executeCreateMCQuestion(req.body.question, req.body.rubric_assignment_id, req.body.question_number));
});


/**
 * Update mcquestion
 * @params  question_id - question_id
 * @body question - question
 * @body question_number - question_number
 */
router.put("/mcquestion/:question_id", async (req, res) => {
    res.json(await rubricPS.executeUpdateMCQuestion(req.body.question, req.body.rubric_assignment_id, req.body.question_number, req.params.question_id));
});

/**
 * Create rangequestion
 * @body question - question
 * @body range - range
 * @body rubric_id - rubric_id
 * @body question_number - question_number
 */
router.post("/rangequestion", async (req, res) => {
    res.json(await RubricPS.executeCreateRangeQuestion(req.body.question, req.body.range, req.body.rubric_assignment_id, req.body.question_number));
});

/**
 * Update rangequestion
 * @params question_id - question_id
 * @body question - question
 * @body range - range
 * @body rubric_id - rubric_id
 * @body question_number - question_number
 */
router.put("/rangequestion/:question_id", async (req, res) => {
    res.json(await rubricPS.executeUpdateRangeQuestion(req.body.question, req.body.range, req.body.rubric_assignment_id, req.body.question_number, req.params.question_id));
});

/**
 * Create open question
 * @body question - question
 * @body rubric_id - rubric_id
 * @body question_number - question_number
 */
router.post("/openquestion", async (req, res) => {
    res.json(RubricPS.executeCreateOpenQuestion(req.body.question, req.body.rubric_assignment_id, req.body.question_number));
});

/**
 * Router to update open question
 * @param question_id - question_id
 */
router.put("/openquestion/:question_id", async (req, res) => {
    res.json(await rubricPS.executeUpdateOpenQuestion(req.body.question, req.body.rubric_assignment_id, req.body.question_number, req.params.question_id));
});

/**
 * Router to make a rubric
 * @body rubric_id
 */
router.post("/", async (req, res) => {
    res.json(await RubricPS.executeCreateRubric(req.body.rubric_assignment_id));
});

/**
 * Router to get all questions of the rubric in format defined in the documentation
 * @params rubric_id
 */
router.get("/:rubric_id", async (req, res) => {
   const rubric_id = req.params.rubric_id;
   const questionJson = await RubricPS.getAllQuestionsByRubricId(rubric_id);

   res.json({
       id: rubric_id,
       assignment_id: rubric_id,
       questions: questionJson
   });
});

