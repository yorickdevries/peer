import RubricPS, { default as rubricPS } from "../prepared_statements/rubric_ps";
import ReviewPS from "../prepared_statements/review_ps";
import ReviewUpdate from "../reviewUpdate";
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
router.delete("/openquestion/:question_id", index.authorization.checkOpenQuestionEdit, (req, res) => {
    RubricPS.executeDeleteOpenQuestion(req.params.question_id)
    .then((data: any) => {
        data.type_question = "open";
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to delete an upload question
 * @params id - id
 */
router.delete("/uploadquestion/:question_id", index.authorization.checkUploadQuestionEdit, (req, res) => {
    RubricPS.executeDeleteUploadQuestion(req.params.question_id)
        .then((data: any) => {
            data.type_question = "upload";
            res.json(data);
        }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to delete a range question
 * @params id - id
 */
router.delete("/rangequestion/:question_id", index.authorization.checkRangeQuestionEdit, (req, res) => {
    RubricPS.executeDeleteRangeQuestion(req.params.question_id)
    .then((data: any) => {
        data.type_question = "range";
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to delete mc question
 * @params id - id
 */
router.delete("/mcquestion/:question_id", index.authorization.checkMCQuestionEdit, async (req, res) => {
    const mcOptions: any = await RubricPS.executeGetAllMCOptionById(req.params.question_id);
    for (let i = 0; i < mcOptions.length; i++) {
        await RubricPS.executeDeleteMCOption(mcOptions[i].id);
    }
    RubricPS.executeDeleteMCQuestion(req.params.question_id)
    .then((data: any) => {
        data.type_question = "mc";
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to delete mc option
 * @params id - id
 */
router.delete("/mcoption/:option_id", index.authorization.checkMCOptionEdit, (req, res) => {
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
router.post("/mcoption", index.authorization.checkMCOptionPost, (req, res) => {
    if (req.body.option == "") {
        // Option cannot be empty
        res.sendStatus(400);
    } else {
        RubricPS.executeCreateMCOption(req.body.option, req.body.mcquestion_id)
        .then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    }
});

/**
 * Route to update mcoption
 *
 */
router.put("/mcoption/:option_id", index.authorization.checkMCOptionEdit, (req, res) => {
    if (req.body.option == "") {
        // Option cannot be empty
        res.sendStatus(400);
    } else {
        RubricPS.executeUpdateMCOption(req.body.option, req.params.option_id)
        .then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    }
});

/**
 * create mcquestion
 * @body question - question
 * @body question_number - question_number
 */
router.post("/mcquestion", index.authorization.checkRubricAuthorizationPostQuestion, (req, res) => {
    RubricPS.executeCreateMCQuestion(req.body.question, req.body.rubric_id, req.body.question_number)
    .then((data: any) => {
        data.type_question = "mc";
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * create uploadquestion
 * @body question - question
 * @body question_number - question_number
 */
router.post("/uploadquestion", index.authorization.checkRubricAuthorizationPostQuestion, (req, res) => {
    RubricPS.executeCreateUploadQuestion(req.body.question, req.body.rubric_id, req.body.question_number, req.body.extension)
        .then((data: any) => {
            data.type_question = "upload";
            res.json(data);
        }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Update uploadquestion
 * @params question_id - question_id
 * @body question - question
 * @body rubric_id - rubric_id
 * @body question_number - question_number
 * @body extension - the file extension
 */
router.put("/uploadquestion/:question_id", index.authorization.checkUploadQuestionEdit, (req, res) => {
    RubricPS.executeUpdateUploadQuestion(req.body.question, req.body.question_number, req.params.question_id, req.body.extension)
        .then((data: any) => {
            data.type_question = "upload";
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
router.put("/mcquestion/:question_id", index.authorization.checkMCQuestionEdit, (req, res) => {
    rubricPS.executeUpdateMCQuestion(req.body.question, req.body.question_number, req.params.question_id)
    .then((data: any) => {
        data.type_question = "mc";
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
router.post("/rangequestion", index.authorization.checkRubricAuthorizationPostQuestion, (req, res) => {
    RubricPS.executeCreateRangeQuestion(req.body.question, req.body.range, req.body.rubric_id, req.body.question_number)
    .then((data: any) => {
        data.type_question = "range";
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
router.put("/rangequestion/:question_id", index.authorization.checkRangeQuestionEdit, (req, res) => {
    rubricPS.executeUpdateRangeQuestion(req.body.question, req.body.range, req.body.question_number, req.params.question_id)
    .then((data: any) => {
        data.type_question = "range";
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
router.post("/openquestion", index.authorization.checkRubricAuthorizationPostQuestion, (req, res) => {
    RubricPS.executeCreateOpenQuestion(req.body.question, req.body.rubric_id, req.body.question_number)
    .then((data: any) => {
        data.type_question = "open";
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Router to update open question
 * @param question_id - question_id
 */
router.put("/openquestion/:question_id", index.authorization.checkOpenQuestionEdit, (req, res) => {
    rubricPS.executeUpdateOpenQuestion(req.body.question, req.body.question_number, req.params.question_id)
    .then((data: any) => {
        data.type_question = "open";
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Router to make a rubric
 * @body rubric_id
 */
router.post("/", index.authorization.checkRubricAuthorizationPost, async (req, res) => {
    try {
        const rubricExists: any = await RubricPS.executeExistsSubmissionRubricByAssignmentId(req.body.assignment_id);
        if (rubricExists.exists) {
            throw new Error("Rubric already exists");
        } else {
            const data = await RubricPS.executeCreateRubric(req.body.assignment_id, req.body.rubric_type);
            res.json(data);
        }
    } catch (error) {
        res.sendStatus(400);
    }
});

/**
 * Router to get all questions of the submission rubric of the assignment
 * @params assignment_id - rubric_id
 */
router.get("/submissionrubric/:assignment_id", index.authorization.enrolledAssignmentCheck, async (req, res) => {
    try {
        const rubric = await RubricPS.executeGetSubmissionRubricByAssignmentId(req.params.assignment_id);
        const questionJson = await RubricPS.getAllQuestionsByRubricId(rubric.id);
        rubric.questions = questionJson;

    res.json(rubric);
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Router to get a rubric
 */
router.get("/:rubric_id", index.authorization.getRubricCheck, async (req, res) => {
    try {
        const rubric = await RubricPS.executeGetRubricById(req.params.rubric_id);
        const questionJson = await RubricPS.getAllQuestionsByRubricId(rubric.id);
        questionJson.sort(function(a, b) {return a.question_number - b.question_number;});

        rubric.questions = questionJson;
        res.json(rubric);
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Route to copy all rubric questions from another rubric, in the same course.
 * @params rubric_id - current rubric id to copy the questions to.
 * @params rubric_copy_id - rubric id to copy from.
 */
router.get("/:rubric_id/copy/:rubric_copy_id", index.authorization.checkRubricAuthorization, async (req, res) => {
    try {
        await RubricPS.copyRubricQuestions(req.params.rubric_id, req.params.rubric_copy_id);
        res.sendStatus(200);
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Route to delete all rubric questions.
 * @params rubric_id - current rubric id.
 */
router.get("/:rubric_id/deleteAll", index.authorization.checkRubricAuthorization, async (req, res) => {
    try {
        await RubricPS.deleteRubricQuestions(req.params.rubric_id);
        res.sendStatus(200);
    } catch {
        res.sendStatus(400);
    }
});


/**
 * Route to submit all filled in reviews
 */
router.get("/:rubric_id/submitallfilledreviews", index.authorization.checkRubricAuthorization, async (req, res) => {
    try {
        const rubricId = req.params.rubric_id;
        const allReviews: any = await ReviewPS.executeGetReviewsByRubricId(rubricId);
        let counter = 0;
        for (let i = 0; i < allReviews.length; i++) {
            // if already done, skip
            if (allReviews[i].done) {
                continue;
            }
            const reviewId = allReviews[i].id;
            const reviewFilled = await ReviewUpdate.isCompletelyFilledIn(reviewId);
            // in case the review is filled, but not submitted, submit it
            if (reviewFilled) {
                await ReviewPS.executeSubmitReview(reviewId);
                console.log("Submitted reviewId: " + reviewId);
                counter++;
            }
        }
        console.log("submitted " + counter + " review(s) for rubric " + rubricId);
        res.json({submittedReviews: counter});
    } catch {
        res.sendStatus(400);
    }
});

export default router;