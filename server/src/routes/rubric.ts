import RubricPS, { default as rubricPS } from "../prepared_statements/rubric_ps";
import bodyParser from "body-parser";
import index from "../security/index";


// Router
import express from "express";

const router = express();
router.use(bodyParser.json());

/**
 * Route to delete an open question
 * @params id - id
 */
router.delete("/openquestion/:question_id", (req, res) => {
    RubricPS.executeDeleteOpenQuestion(req.params.question_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to delete a range question
 * @params id - id
 */
router.delete("/rangequestion/:question_id", (req, res) => {
    RubricPS.executeDeleteRangeQuestion(req.params.question_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to delete mc question
 * @params id - id
 */
router.delete("/mcquestion/:question_id", (req, res) => {
    RubricPS.executeDeleteMCQuestion(req.params.question_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to delete mc option
 * @params id - id
 */
router.delete("/mcoption/:option_id", (req, res) => {
    RubricPS.executeDeleteMCOption(req.params.option_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to create an option for a multiple choice question
 * @body option, mcquestion_id
 */
router.post("/mcoption", (req, res) => {
    RubricPS.executeCreateMCOption(req.body.option, req.body.mcquestion_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to update mcoption
 *
 */
router.put("/mcoption/:option_id", (req, res) => {
    RubricPS.executeUpdateMCOption(req.body.option, req.body.mcquestion_id, req.params.option_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * create mcquestion
 * @body question - question
 * @body question_number - question_number
 */
router.post("/mcquestion", index.authorization.checkRubricAuthorizationPost, (req, res) => {
    RubricPS.executeCreateMCQuestion(req.body.question, req.body.rubric_assignment_id, req.body.question_number)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});


/**
 * Update mcquestion
 * @params  question_id - question_id
 * @body question - question
 * @body question_number - question_number
 */
router.put("/mcquestion/:question_id", (req, res) => {
    rubricPS.executeUpdateMCQuestion(req.body.question, req.body.rubric_assignment_id, req.body.question_number, req.params.question_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Create rangequestion
 * @body question - question
 * @body range - range
 * @body rubric_id - rubric_id
 * @body question_number - question_number
 */
router.post("/rangequestion", index.authorization.checkRubricAuthorizationPost, (req, res) => {
    RubricPS.executeCreateRangeQuestion(req.body.question, req.body.range, req.body.rubric_assignment_id, req.body.question_number)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Update rangequestion
 * @params question_id - question_id
 * @body question - question
 * @body range - range
 * @body rubric_id - rubric_id
 * @body question_number - question_number
 */
router.put("/rangequestion/:question_id", (req, res) => {
    rubricPS.executeUpdateRangeQuestion(req.body.question, req.body.range, req.body.rubric_assignment_id, req.body.question_number, req.params.question_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Create open question
 * @body question - question
 * @body rubric_id - rubric_id
 * @body question_number - question_number
 */
router.post("/openquestion", index.authorization.checkRubricAuthorizationPost, (req, res) => {
    RubricPS.executeCreateOpenQuestion(req.body.question, req.body.rubric_assignment_id, req.body.question_number)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Router to update open question
 * @param question_id - question_id
 */
router.put("/openquestion/:question_id", (req, res) => {
    rubricPS.executeUpdateOpenQuestion(req.body.question, req.body.rubric_assignment_id, req.body.question_number, req.params.question_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Router to make a rubric
 * @body rubric_id
 */
router.post("/", index.authorization.checkRubricAuthorizationPost, (req, res) => {
    RubricPS.executeCreateRubric(req.body.rubric_assignment_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Router to get all questions of the rubric in format defined in the documentation
 * @params rubric_id
 */
router.get("/:rubric_id", async (req, res) => {
    try {
    const rubric_id = req.params.rubric_id;
    const questionJson = await RubricPS.getAllQuestionsByRubricId(req.params.rubric_id);

    res.json({
        id: rubric_id,
        assignment_id: rubric_id,
        questions: questionJson});
    } catch {
        res.sendStatus(400);
    }
});

export default router;