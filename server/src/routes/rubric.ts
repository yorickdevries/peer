import RubricPS, {default as rubricPS} from "../prepared_statements/rubric_ps"

// Router
import { Router } from "express";
const router = Router();

export default router;

/**
 * Route to create an option for a multiple choice question
 * @body option, mcquestion_id
 */
router.post("/mcoption", async (req, res) => {
    res.json(RubricPS.executeCreateMCOption(req.body.option, req.body.mcquestion_id));
});

/**
 * Route to update an option for a multiple choice question
 * @body option, mcquestion_id
 * @params option_id
 */
router.put("/mcoption/:option_id", async (req, res) => {
    res.json(RubricPS.executeUpdateMCOption(req.body.option, req.body.mcquestion_id, req.params.option_id));
});

/**
 * Route to create a multiple choice question
 * @body question, rubric_id, question_number
 */
router.post("/mcquestion", async (req, res) => {
    res.json(RubricPS.executeCreateMCQuestion(req.body.question, req.body.rubric_id, req.body.question_number));
});

/**
 * Route to update a multiple choice question
 * @params question_id
 * @body question, rubric_id, question_number
 */
router.put("/mcquestion/:question_id", async (req, res) => {
    res.json(rubricPS.executeUpdateMCQuestion(req.body.question, req.body.rubric_id, req.body.question_number, req.params.question_id));
});

/**
 * Route to create a range question
 * @body quesiton, range, rubric_id, question_number
 */
router.post("/rangequestion", async (req, res) => {
    res.json(RubricPS.executeCreateRangeQuestion(req.body.question, req.body.range, req.body.rubric_id, req.body.question_number));
});

/**
 * Route to update a range question
 * @param question_id
 * @body question, range, rubric_id, question_number
 */
router.put("/rangequestion/:question_id", async (req, res) => {
    res.json(rubricPS.executeUpdateRangeQuestion(req.body.question, req.body.range, req.body.rubric_id, req.body.question_number, req.params.question_id));
});

/**
 * Route to create an open question
 * @body question, rubric_id, question_number
 */
router.post("/openquestion", async (req, res) => {
    res.json(RubricPS.executeCreateOpenQuestion(req.body.question, req.body.rubric_id, req.body.question_number));
});

/**
 * Route to update an open question
 * @params question_id
 * @body question, rubric_id, question_number
 */
router.put("/openquestion/:question_id", async (req, res) => {
    res.json(rubricPS.executeUpdateOpenQuestion(req.body.question, req.body.rubric_id, req.body.question_number, req.params.question_id));
});

/**
 * Router to make a rubric
 * @body rubric_id
 */
router.post("/", async (req, res) => {
    res.json(RubricPS.executeCreateRubric(req.body.rubric_id));
});


/**
 * Router to get all questions of the rubric in format defined in the documentation
 * @params rubric_id
 */
router.get("/:rubric_id", async (req, res) => {
   const rubric_id = req.params.rubric_id;
   let mcQuestions = await RubricPS.executeGetAllMCQuestionById(rubric_id);
   let openQuestions = await RubricPS.executeGetAllOpenQuestionById(rubric_id);
   let rangeQuestions = await RubricPS.executeGetAllRangeQuestionById(rubric_id);
   let questionJson: any[] = [];

   for (var i = 0; i<mcQuestions.length; i++) {
        questionJson.push({
           id: mcQuestions[i].id,
           type_question: mcQuestions[i].type_question,
           question: mcQuestions[i].question,
           question_number: mcQuestions[i].question_number,
           option: await RubricPS.executeGetAllMCOptionById(mcQuestions[i].id)
       });
   }

   for (var i = 0; i<openQuestions.length; i++) {
       questionJson.push(openQuestions[i]);
   }
   for (var i = 0; i<rangeQuestions.length; i++) {
       questionJson.push(rangeQuestions[i]);
   }

   res.json({
       id: rubric_id,
       assignment_id: rubric_id,
       questions: questionJson
   })
});