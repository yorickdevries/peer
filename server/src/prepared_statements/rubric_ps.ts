import Database from "../database";
import pgp, { default as pgPromise, PreparedStatement } from "pg-promise";

/**
 * Prepared stement class for rubric routes
 */
export default class RubricPS {

    /**
     * executes 'get rubric by id' query
     * @param {number} assignmentId - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeGetRubricById(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement =  new PreparedStatement("get-rubric-by-id",
        "SELECT * FROM rubric WHERE assignment_id=$1");
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * check whether there already is a rubric with a certain assignment id
     * @param {number} assignmentId - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeExistsRubricByAssignmentId(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement =  new PreparedStatement("exists-rubric-by-assignmentid",
        "SELECT EXISTS(SELECT * FROM rubric WHERE assignment_id=$1)");
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete rubric'
     * @param {number} id - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteRubric(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delete-rubric",
            "DELETE FROM rubric WHERE assignment_id=$1 RETURNING *");
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete mc option'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteMCOption(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delte-mc-option",
            "DELETE FROM mcoption WHERE id=$1 RETURNING *");
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete MC question'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteMCQuestion(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delete-mc-question",
            "DELETE FROM mcquestion WHERE id=$1 RETURNING *");
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delete open question'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteOpenQuestion(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delete-open-question",
            "DELETE FROM openquestion WHERE id=$1 RETURNING *");
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * Query 'delte range qustion'
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeDeleteRangeQuestion(id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("delete-range-question",
            "DELETE FROM rangequestion WHERE id=$1 RETURNING *");
        statement.values = [id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'update mc option' query
     * @param {string} option
     * @param {number} mcquestionId
     * @param {number} id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateMCOption(option: string, id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("updat-mc-option",
            "UPDATE mcoption SET option=$1 WHERE id = $2 RETURNING *");
        statement.values = [option, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'update mc question' query
     * @param {string} question - question
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateMCQuestion(question: string, questionNumber: number, id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("update-mc-question",
            "UPDATE mcquestion SET (question, question_number) = ($1, $2) WHERE id = $3 RETURNING *");
        statement.values = [question, questionNumber, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'update range question' query
     * @param {string} question - question
     * @param {number} range - range
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateRangeQuestion(question: string, range: number, questionNumber: number, id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("update-range-question",
            "UPDATE rangequestion SET (question, range, question_number) = ($1, $2, $3) WHERE id = $4 RETURNING *");
        statement.values = [question, range, questionNumber, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'update open question' query
     * @param {string} question - question
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @param {number} id - id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeUpdateOpenQuestion(question: string, questionNumber: number, id: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("update-open-question",
            "UPDATE openquestion SET (question, question_number) = ($1, $2) WHERE id = $3 RETURNING *");
        statement.values = [question, questionNumber, id];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'create MC option' query
     * @param {string} option - option
     * @param {number} mcquestionId - mcquestion_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateMCOption(option: string, mcquestionId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("make-MC-option",
            "INSERT INTO mcoption (option, mcquestion_id) VALUES ($1, $2) RETURNING *");
        statement.values = [option, mcquestionId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'create range question' query
     * @param {string} question - question
     * @param {number} range - range
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateRangeQuestion(question: string, range: number, rubricAssignmentId: number, questionNumber: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("make-range-question",
            "INSERT INTO rangequestion (question, range, rubric_assignment_id, question_number) VALUES ($1, $2, $3, $4) RETURNING *");
        statement.values = [question, range, rubricAssignmentId, questionNumber];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'create mc question' query
     * @param {string} question - question
     * @param {number} rubricAssignmentId - rubric_assignment_id
     * @param {number} questionNumber - question_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateMCQuestion(question: string, rubricAssignmentId: number, questionNumber: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("make-MC-question",
            "INSERT INTO mcquestion (question, rubric_assignment_id, question_number) VALUES ($1, $2, $3) RETURNING *");
        statement.values = [question, rubricAssignmentId, questionNumber];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'create open question' query
     * @param {string} question - question
     * @param {number} assignmentId - assignment_id
     * @param {number} questionNr - questino_number
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateOpenQuestion(question: string, assignmentId: number, questionNr: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("make-open-question",
            "INSERT INTO openquestion (question, rubric_assignment_id, question_number) VALUES ($1, $2, $3) RETURNING *");
        statement.values = [question, assignmentId, questionNr];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'create rubric' query
     * @param {number} assignmentId - assignment_id
     * @returns {Promise<pgPromise.queryResult>}
     */
    public static executeCreateRubric(assignmentId: number): Promise<pgPromise.queryResult> {
        const statement = new PreparedStatement("create-rubric",
            'INSERT INTO "rubric" ("assignment_id") VALUES ($1) RETURNING *');
        statement.values = [assignmentId];
        return Database.executeQuerySingleResult(statement);
    }

    /**
     * executes 'get all options by id' query
     * @param {number} id - mcquestion_id
     * @returns {any}
     */
    public static executeGetAllMCOptionById(id: number): any {
        const statement = new PreparedStatement("get-all-options",
            "SELECT * FROM mcoption WHERE mcquestion_id = $1");
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * executes 'get all range questions' query
     * @param {number} id - assignment_id
     * @returns {any}
     */
    public static executeGetAllRangeQuestionById(id: number): any {
        const statement = new PreparedStatement("get-all-rangequestion",
            "SELECT * FROM rangequestion WHERE rubric_assignment_id = $1");
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * executes 'get all open questions' query
     * @param {number} id - assignment_id
     * @returns {any}
     */
    public static executeGetAllOpenQuestionById(id: number): any {
        const statement = new PreparedStatement("get-all-openquestions",
            "SELECT * FROM openquestion WHERE rubric_assignment_id = $1");
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * executes 'get all MC questions' qeury
     * @param {number} id - assignment_id
     * @returns {any}
     */
    public static executeGetAllMCQuestionById(id: number): any {
        const statement = new PreparedStatement("get-all-MC-questions",
            "SELECT * FROM mcquestion WHERE rubric_assignment_id = $1");
        statement.values = [id];
        return Database.executeQuery(statement);
    }

    /**
     * Funtion that creates the rubric of all questions
     * @param {number} rubricId - rubric_id
     * @returns {Promise<any[]>}
     */
    public static async getAllQuestionsByRubricId(rubricId: number) {
        const mcQuestions = await RubricPS.executeGetAllMCQuestionById(rubricId);
        const openQuestions = await RubricPS.executeGetAllOpenQuestionById(rubricId);
        const rangeQuestions = await RubricPS.executeGetAllRangeQuestionById(rubricId);
        const questionJson: any[] = [];


        for (let i = 0; i < mcQuestions.length; i++) {
            questionJson.push({
                id: mcQuestions[i].id,
                type_question: mcQuestions[i].type_question,
                rubric_assignment_id: mcQuestions[i].rubric_assignment_id,
                question: mcQuestions[i].question,
                question_number: mcQuestions[i].question_number,
                option: await RubricPS.executeGetAllMCOptionById(mcQuestions[i].id)
        });
        }

        for (let i = 0; i < openQuestions.length; i++) {
            questionJson.push(openQuestions[i]);
        }
        for (let i = 0; i < rangeQuestions.length; i++) {
            questionJson.push(rangeQuestions[i]);
        }

        return questionJson;
    }

}