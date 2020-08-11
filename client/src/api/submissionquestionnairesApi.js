import axios from "axios"

const client = axios.create({
    baseURL: "/api/temp/submissionquestionnaires/",
    json: true
})

export default {
    createSubmissionQuestionnaire(assignmentId) {
        return client.post("", assignmentId)
    },
    getSubmissionQuestionnaire(submissionQuestionnaireId) {
        return client.get(`${submissionQuestionnaireId}`)
    },
    copyQuestionsSubmissionQuestionnaire(submissionQuestionnaireId, copyFromQuestionnaireId) {
        return client.patch(`${submissionQuestionnaireId}`, copyFromQuestionnaireId)
    }
}
