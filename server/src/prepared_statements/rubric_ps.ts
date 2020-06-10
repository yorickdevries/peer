import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared statement class for rubric routes.
 */
export default class RubricPS {

    /**
     * Executes 'get rubric by RubricId' query.
     */
    public static executeGetRubricById(id: number): Promise<any> {
        const statement = new PreparedStatement({name: "get-rubric-by-id", text:
            "SELECT * FROM rubric WHERE id=$1"});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'get Submission rubric by AssignmentId' query.
     */
    public static executeGetSubmissionRubricByAssignmentId(assignmentId: number): Promise<any> {
        const statement = new PreparedStatement({name: "get-submission-rubric-by-assignment-id", text:
            "SELECT * FROM rubric WHERE assignment_id=$1 AND type = 'submission'"});
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'get Review rubric by AssignmentId' query.
     */
    public static executeGetReviewEvaluationRubricByAssignmentId(assignmentId: number): Promise<any> {
        const statement = new PreparedStatement({name: "get-review-rubric-by-assignment-id", text:
            "SELECT * FROM rubric WHERE assignment_id=$1 AND type = 'review'"});
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Check whether there already is a rubric with a certain assignment id.
     * @param {number} assignmentId - assignment_id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeExistsSubmissionRubricByAssignmentId(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "exists-rubric-by-assignmentid", text:
            "SELECT EXISTS(SELECT * FROM rubric WHERE assignment_id=$1 AND type = 'submission')"});
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete mc option'.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteMCOption(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delte-mc-option", text:
            "DELETE FROM mcoption WHERE id=$1 RETURNING *"});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete MC question'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteMCQuestion(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delete-mc-question", text:
            "DELETE FROM mcquestion WHERE id=$1 RETURNING *"});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete open question'.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteOpenQuestion(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delete-open-question", text:
            "DELETE FROM openquestion WHERE id=$1 RETURNING *"});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete range question'.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteRangeQuestion(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delete-range-question", text:
            "DELETE FROM rangequestion WHERE id=$1 RETURNING *"});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete upload question'.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteUploadQuestion(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delete-upload-question", text:
            "DELETE FROM uploadquestion WHERE id=$1 RETURNING *"});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'update mc option' query.
     * @param {string} option
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateMCOption(option: string, id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "updat-mc-option", text:
            "UPDATE mcoption SET option=$1 WHERE id = $2 RETURNING *"});
        statement.values = [option, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'update mc question' query.
     * @param {string} question - question.
     * @param {number} questionNumber - question_number.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateMCQuestion(question: string, questionNumber: number, id: number, optional: boolean)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "update-mc-question", text:
            "UPDATE mcquestion SET (question, question_number, optional) = ($1, $2, $3) WHERE id = $4 RETURNING *"});
        statement.values = [question, questionNumber, optional, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'update range question' query.
     * @param {string} question - question.
     * @param {number} range - range.
     * @param {number} questionNumber - question_number.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateRangeQuestion(question: string, range: number, questionNumber: number, id: number, optional: boolean)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "update-range-question", text:
            "UPDATE rangequestion SET (question, range, question_number, optional) = ($1, $2, $3, $4) " +
            "WHERE id = $5 RETURNING *"});
        statement.values = [question, range, questionNumber, optional, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'update open question' query.
     * @param {string} question - question.
     * @param {number} questionNumber - question_number.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateOpenQuestion(question: string, questionNumber: number, id: number, optional: boolean)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "update-open-question", text:
            "UPDATE openquestion SET (question, question_number, optional) = ($1, $2, $3) WHERE id = $4 RETURNING *"});
        statement.values = [question, questionNumber, optional, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'update upload question' query.
     * @param {string} question - question.
     * @param {number} questionNumber - question_number.
     * @param {number} id - id.
     * @param {string} extension - the file extension.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateUploadQuestion(question: string, questionNumber: number, id: number, extension: string, optional: boolean)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "update-upload-question", text:
            "UPDATE uploadquestion SET (question, question_number, extension, optional) = ($1, $2, $3, $4) WHERE id = $5 RETURNING *"});
        statement.values = [question, questionNumber, extension, optional, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'create MC option' query.
     * @param {string} option - option.
     * @param {number} mcquestionId - mcquestion_id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateMCOption(option: string, mcquestionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "make-MC-option", text:
            "INSERT INTO mcoption (option, mcquestion_id) VALUES ($1, $2) RETURNING *"});
        statement.values = [option, mcquestionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'create range question' query.
     * @param {string} question - question.
     * @param {number} range - range.
     * @param {number} rubricId - rubric_id.
     * @param {number} questionNumber - question_number.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateRangeQuestion(question: string, range: number, rubricId: number,
                                             questionNumber: number, optional: boolean): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "make-range-question", text:
            "INSERT INTO rangequestion (question, range, rubric_id, question_number, optional) " +
            "VALUES ($1, $2, $3, $4, $5) RETURNING *"});
        statement.values = [question, range, rubricId, questionNumber, optional];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'create mc question' query.
     * @param {string} question - question.
     * @param {number} rubricId - rubric_id.
     * @param {number} questionNumber - question_number.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateMCQuestion(question: string, rubricId: number, questionNumber: number, optional: boolean)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "make-MC-question", text:
            "INSERT INTO mcquestion (question, rubric_id, question_number, optional) VALUES ($1, $2, $3, $4) " +
            "RETURNING *"});
        statement.values = [question, rubricId, questionNumber, optional];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'create open question' query.
     * @param {string} question - question.
     * @param {number} rubricId - rubricId
     * @param {number} questionNr - questino_number.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateOpenQuestion(question: string, rubricId: number, questionNr: number, optional: boolean)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "make-open-question", text:
            "INSERT INTO openquestion (question, rubric_id, question_number, optional) VALUES ($1, $2, $3, $4) " +
            "RETURNING *"});
        statement.values = [question, rubricId, questionNr, optional];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'create upload question' query.
     * @param {string} question - question.
     * @param {number} rubricId - rubricId.
     * @param {number} questionNr - question_number.
     * @param {string} extension - extension of the file.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateUploadQuestion(question: string, rubricId: number, questionNr: number, extension: string, optional: boolean)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "make-upload-question", text:
            "INSERT INTO uploadquestion (question, extension, rubric_id, question_number, optional) VALUES ($1, $2, $3, $4, $5) " +
            "RETURNING *"});
        statement.values = [question, extension, rubricId, questionNr, optional];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'create rubric' query.
     * @param {number} assignmentId - assignment_id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateRubric(assignmentId: number, rubricType: string): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "create-rubric", text:
            'INSERT INTO "rubric" ("assignment_id", "type") VALUES ($1, $2) RETURNING *'});
        statement.values = [assignmentId, rubricType];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'get all options by id' query.
     * @param {number} id - mcquestion_id.
     * @returns {any}
     */
    public static executeGetAllMCOptionById(id: number): any {
        // order the options alphabetically
        const statement = new PreparedStatement({name: "get-all-options", text:
            "SELECT * FROM mcoption WHERE mcquestion_id = $1 ORDER BY option"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Executes 'get all range questions' query.
     * @param {number} id - assignment_id.
     * @returns {any}
     */
    public static executeGetAllRangeQuestionById(id: number): any {
        const statement = new PreparedStatement({name: "get-all-rangequestion", text:
            "SELECT * FROM rangequestion WHERE rubric_id = $1"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Gets One range question by Id and RubricId.
     * @param {number} questionId - question id.
     * @param {number} rubricId - rubric id.
     * @return {any} single range question as pg promise.
     */
    public static executeGetRangeQuestionByIdAndRubricId(questionId: number, rubricId: number): any {
        const statement = new PreparedStatement({name: "get-one-rangequestion", text:
            "SELECT * FROM rangequestion WHERE id = $1 AND rubric_id = $2"});
        statement.values = [questionId, rubricId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'get all open questions' query.
     * @param {number} id - assignment_id.
     * @returns {any}
     */
    public static executeGetAllOpenQuestionById(id: number): any {
        const statement = new PreparedStatement({name: "get-all-openquestions", text:
            "SELECT * FROM openquestion WHERE rubric_id = $1"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Gets One open question by Id and RubricId.
     * @param {number} questionId - question id,
     * @param {number} rubricId - rubric id.
     * @return {any} open question as pg promise.
     */
    public static executeGetOpenQuestionByIdAndRubricId(questionId: number, rubricId: number): any {
        const statement = new PreparedStatement({name: "get-one-openquestion", text:
            "SELECT * FROM openquestion WHERE id = $1 AND rubric_id = $2"});
        statement.values = [questionId, rubricId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'get all MC questions' query.
     * @param {number} id - assignment_id
     * @returns {any}
     */
    public static executeGetAllMCQuestionById(id: number): any {
        const statement = new PreparedStatement({name: "get-all-MC-questions", text:
            "SELECT * FROM mcquestion WHERE rubric_id = $1"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Executes 'get all Upload questions' query.
     * @param {number} id - rubric_id
     * @returns {any}
     */
    public static executeGetAllUploadQuestionById(id: number): any {
        const statement = new PreparedStatement({name: "get-all-upload-questions", text:
            "SELECT * FROM uploadquestion WHERE rubric_id = $1"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Gets One MC question by Id and RubricId.
     * @param {number} questionId - question id.
     * @param {number} rubricId - rubric id.
     * @return {any}
     */
    public static executeGetMCQuestionByIdAndRubricId(questionId: number, rubricId: number): any {
        const statement = new PreparedStatement({name: "get-one-mcquestion", text:
            "SELECT * FROM mcquestion WHERE id = $1 AND rubric_id = $2"});
        statement.values = [questionId, rubricId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Gets One Upload question by Id and RubricId.
     * @param {number} questionId - question id.
     * @param {number} rubricId - rubric id.
     * @return {any}
     */
    public static executeGetUploadQuestionByIdAndRubricId(questionId: number, rubricId: number): any {
        const statement = new PreparedStatement({name: "get-one-uploadquestion", text:
            "SELECT * FROM uploadquestion WHERE id = $1 AND rubric_id = $2"});
        statement.values = [questionId, rubricId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Function that gets the rubric of all questions.
     * @param {number} rubricId - rubric_id.
     * @returns all questions by rubric id.
     */
    public static async getAllQuestionsByRubricId(rubricId: number) {
        // Fetch the questions of each type.
        const mcQuestions = await RubricPS.executeGetAllMCQuestionById(rubricId);
        const checkboxQuestions = await RubricPS.executeGetAllCheckboxQuestionById(rubricId);
        const openQuestions = await RubricPS.executeGetAllOpenQuestionById(rubricId);
        const rangeQuestions = await RubricPS.executeGetAllRangeQuestionById(rubricId);
        const uploadQuestions = await RubricPS.executeGetAllUploadQuestionById(rubricId);

        // Construct and fill the questions array.
        let questionJson: any[] = [];

        // Fill with mc questions.
        for (let i = 0; i < mcQuestions.length; i++) {
            const question = mcQuestions[i];
            questionJson.push({
                id: question.id,
                type_question: "mc",
                rubric_id: question.rubric_id,
                question: question.question,
                question_number: question.question_number,
                option: await RubricPS.executeGetAllMCOptionById(question.id),
                optional: question.optional
            });
        }

        // Fill with checkbox questions.
        for (let i = 0; i < checkboxQuestions.length; i++) {
            const question = checkboxQuestions[i];
            questionJson.push({
                id: question.id,
                type_question: "checkbox",
                rubric_id: question.rubric_id,
                question: question.question,
                question_number: question.question_number,
                option: await RubricPS.executeGetAllCheckboxOptionsByQuestionId(question.id),
                optional: question.optional
            });
        }

        // Fill with open questions.
        const openQuestionsWithType = RubricPS.addTypeToQuestions(openQuestions, "open");
        questionJson = questionJson.concat(openQuestionsWithType);

        // Fill with range questions.
        const rangeQuestionsWithType = RubricPS.addTypeToQuestions(rangeQuestions, "range");
        questionJson = questionJson.concat(rangeQuestionsWithType);

        // Fill with upload questions
        const uploadQuestionsWithType = RubricPS.addTypeToQuestions(uploadQuestions, "upload");
        questionJson = questionJson.concat(uploadQuestionsWithType);

        return questionJson;
    }

    /**
     * Add a type string to the question object.
     * @param questions - question array.
     * @param {string} type - type of the question.
     * @return {any}
     */
    public static addTypeToQuestions(questions: any[], type: string): any {
        const result = [];
        for (const question of questions) {
            question.type_question = type;
            result.push(question);
        }
        return result;
    }

    /**
     * Copy rubric questions.
     * @param {number} currentRubricId - id of the rubric.
     * @param {number} copyRubricId - id of the rubric to copy.
     * @return {Promise<void>} - void, but rubric will be copied in the database.
     */
    public static async copyRubricQuestions(currentRubricId: number, copyRubricId: number) {
        // Fetch the questions of each type.
        const openQuestions = await RubricPS.executeGetAllOpenQuestionById(copyRubricId);
        const rangeQuestions = await RubricPS.executeGetAllRangeQuestionById(copyRubricId);
        const mcQuestions = await RubricPS.executeGetAllMCQuestionById(copyRubricId);
        const checkboxQuestions = await RubricPS.executeGetAllCheckboxQuestionById(copyRubricId);
        const uploadQuestions = await RubricPS.executeGetAllUploadQuestionById(copyRubricId);
        let mcOptions;
        let checkboxOptions;

        // Copy open questions
        for (let i = 0; i < openQuestions.length; i++) {
            await this.executeCreateOpenQuestion(openQuestions[i].question, currentRubricId, openQuestions[i].question_number, openQuestions[i].optional);
        }
        // Copy range questions
        for (let i = 0; i < rangeQuestions.length; i++) {
            await this.executeCreateRangeQuestion(rangeQuestions[i].question, rangeQuestions[i].range, currentRubricId, rangeQuestions[i].question_number, rangeQuestions[i].optional);
        }
        // Copy upload questions
        for (let i = 0; i < uploadQuestions.length; i++) {
            await this.executeCreateUploadQuestion(uploadQuestions[i].question, currentRubricId, uploadQuestions[i].question_number, uploadQuestions[i].extension, uploadQuestions[i].optional);
        }
        // Copy mc questions
        for (let i = 0; i < mcQuestions.length; i++) {
            const res: any = await this.executeCreateMCQuestion(mcQuestions[i].question, currentRubricId, mcQuestions[i].question_number, mcQuestions[i].optional);

            // Copy mc options
            mcOptions = await RubricPS.executeGetAllMCOptionById(mcQuestions[i].id);
            for (let i = 0; i < mcOptions.length; i++) {
                await this.executeCreateMCOption(mcOptions[i].option, res.id);
            }
        }

        // Copy checkbox questions
        for (let i = 0; i < checkboxQuestions.length; i++) {
            const res: any = await this.executeCreateCheckboxQuestion(checkboxQuestions[i].question, currentRubricId, checkboxQuestions[i].question_number, checkboxQuestions[i].optional);

            // Copy checkbox options
            checkboxOptions = await RubricPS.executeGetAllCheckboxOptionsByQuestionId(checkboxQuestions[i].id);
            for (let i = 0; i < checkboxOptions.length; i++) {
                await this.executeCreateCheckboxOption(checkboxOptions[i].option, res.id);
            }
        }
    }

    /**
     * Delete all rubric questions in the database.
     * @param {number} rubricId - rubric id containing questions.
     * @return {Promise<void>} - delete all rubric questions.
     */
    public static async deleteRubricQuestions(rubricId: number) {
        // Fetch the questions of each type.
        const openQuestions = await RubricPS.executeGetAllOpenQuestionById(rubricId);
        const rangeQuestions = await RubricPS.executeGetAllRangeQuestionById(rubricId);
        const mcQuestions = await RubricPS.executeGetAllMCQuestionById(rubricId);
        const checkboxQuestions = await RubricPS.executeGetAllCheckboxQuestionById(rubricId);
        const uploadQuestions = await RubricPS.executeGetAllUploadQuestionById(rubricId);
        let mcOptions;
        let checkboxOptions;

        // Delete open questions
        for (let i = 0; i < openQuestions.length; i++) {
            await this.executeDeleteOpenQuestion(openQuestions[i].id);
        }
        // Delete range questions
        for (let i = 0; i < rangeQuestions.length; i++) {
            await this.executeDeleteRangeQuestion(rangeQuestions[i].id);
        }
        // Delete rubric questions
        for (let i = 0; i < uploadQuestions.length; i++) {
            await this.executeDeleteUploadQuestion(uploadQuestions[i].id);
        }
        // Delete mc questions
        for (let i = 0; i < mcQuestions.length; i++) {
            // Delete mc options
            mcOptions = await RubricPS.executeGetAllMCOptionById(mcQuestions[i].id);
            for (let i = 0; i < mcOptions.length; i++) {
                await this.executeDeleteMCOption(mcOptions[i].id);
            }
            await this.executeDeleteMCQuestion(mcQuestions[i].id);
        }
        // Delete checkbox questions
        for (let i = 0; i < checkboxQuestions.length; i++) {
            // Delete checkbox options
            checkboxOptions = await RubricPS.executeGetAllCheckboxOptionsByQuestionId(checkboxQuestions[i].id);
            for (let i = 0; i < checkboxOptions.length; i++) {
                await this.executeDeleteCheckboxOption(checkboxOptions[i].id);
            }
            await this.executeDeleteCheckboxQuestion(checkboxQuestions[i].id);
        }
    }

    /**
     * Executes 'create checkbox question' query.
     * @param {string} question - question.
     * @param {number} rubricId - rubric_id.
     * @param {number} questionNumber - question_number.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateCheckboxQuestion(question: string, rubricId: number, questionNumber: number, optional: boolean)
        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "make-Checkbox-question", text:
            "INSERT INTO checkboxquestion (question, rubric_id, question_number, optional) VALUES ($1, $2, $3, $4) " +
            "RETURNING *"});
        statement.values = [question, rubricId, questionNumber, optional];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'update checkbox question' query.
     * @param {string} question - question.
     * @param {number} questionNumber - question_number.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateCheckboxQuestion(question: string, questionNumber: number, id: number, optional: boolean)

        : Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "update-checkbox-question", text:
            "UPDATE checkboxquestion SET (question, question_number, optional) = ($1, $2, $3) WHERE id = $4 RETURNING *"});
        statement.values = [question, questionNumber, optional, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete Checkbox question'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteCheckboxQuestion(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delete-checkbox-question", text:
            "DELETE FROM checkboxquestion WHERE id=$1 RETURNING *"});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'create Checkbox option' query.
     * @param {string} option - option.
     * @param {number} checkboxQuestionId - checkboxquestion_id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateCheckboxOption(option: string, checkboxQuestionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "make-Checkbox-option", text:
            "INSERT INTO checkboxoption (option, checkboxquestion_id) VALUES ($1, $2) RETURNING *"});
        statement.values = [option, checkboxQuestionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'update checkbox option' query.
     * @param {string} option
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateCheckboxOption(option: string, id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "updat-checkbox-option", text:
            "UPDATE checkboxoption SET option=$1 WHERE id = $2 RETURNING *"});
        statement.values = [option, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete checkbox option'.
     * @param {number} id - id.
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteCheckboxOption(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement({name: "delte-checkbox-option", text:
            "DELETE FROM checkboxoption WHERE id=$1 RETURNING *"});
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'get all options by id' query.
     * @param {number} id - checkboxquestion_id.
     * @returns {any}
     */
    public static executeGetAllCheckboxOptionsByQuestionId(checkBoxQuestionId: number): any {
        // order the options alphabetically
        const statement = new PreparedStatement({name: "get-all-checkbox-options", text:
            "SELECT * FROM checkboxoption WHERE checkboxquestion_id = $1 ORDER BY option"});
        statement.values = [checkBoxQuestionId];
        return Database.executeQuery(statement);
    }

    /**
     * Gets One Checkbox question by Id and RubricId.
     * @param {number} questionId - question id.
     * @param {number} rubricId - rubric id.
     * @return {any}
     */
    public static executeGetCheckboxQuestionByIdAndRubricId(questionId: number, rubricId: number): any {
        const statement = new PreparedStatement({name: "get-one-checkboxquestion", text:
            "SELECT * FROM checkboxquestion WHERE id = $1 AND rubric_id = $2"});
        statement.values = [questionId, rubricId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Executes 'get all Checkbox questions' query.
     * @param {number} id - assignment_id
     * @returns {any}
     */
    public static executeGetAllCheckboxQuestionById(id: number): any {
        const statement = new PreparedStatement({name: "get-all-checkbox-questions", text:
            "SELECT * FROM checkboxquestion WHERE rubric_id = $1"});
        statement.values = [id];
        return Database.executeQuery(statement);
    }

}