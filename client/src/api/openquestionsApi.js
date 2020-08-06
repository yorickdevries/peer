import axios from "axios"

const client = axios.create({
    baseURL: "/api/openquestions/",
    json: true
})

export default {
    createOpenQuestion(question) {
        return client.post("",question)
    }
    // getSubmissionQuestionnaire(submissionQuestionnaireId) {
    //     return client.get( `${submissionQuestionnaireId}`)
    // },
    // copyQuestionsSubmissionQuestionnaire(submissionQuestionnaireId, copyFromQuestionnaireId){
    //     return client.patch(`${submissionQuestionnaireId}`, copyFromQuestionnaireId)
    // }
}